import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";

import { coursesFixtures } from "fixtures/coursesFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import CoursesTable from "main/components/Courses/CoursesTable";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/courseUtils";

const { mockMutate, mockUseBackendMutation } = vi.hoisted(() => {
  const mutate = vi.fn();
  const useBackendMutationMock = vi.fn(() => ({ mutate }));
  return { mockMutate: mutate, mockUseBackendMutation: useBackendMutationMock };
});

vi.mock("main/utils/useBackend", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useBackendMutation: mockUseBackendMutation,
  };
});

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("CoursesTable tests", () => {
  const queryClient = new QueryClient();
  const testId = "CoursesTable";
  const expectedHeaders = ["id", "Code", "Name", "Term"];
  const expectedFields = ["id", "code", "name", "term"];

  beforeEach(() => {
    mockMutate.mockReset();
    mockUseBackendMutation.mockReset();
    mockUseBackendMutation.mockReturnValue({ mutate: mockMutate });
    mockedNavigate.mockClear();
  });

  const renderTable = (courses, currentUser, props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CoursesTable
            courses={courses}
            currentUser={currentUser}
            {...props}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("Has the expected column headers and content for ordinary user", () => {
    renderTable(coursesFixtures.threeCourses, currentUserFixtures.userOnly);

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-code`),
    ).toHaveTextContent("CHEM 123");
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("Has the expected column headers and content for admin user", () => {
    renderTable(coursesFixtures.threeCourses, currentUserFixtures.adminUser);

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-code`),
    ).toHaveTextContent("CHEM 123");

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Edit button navigates to the edit page for admin user", async () => {
    renderTable(coursesFixtures.threeCourses, currentUserFixtures.adminUser);

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/admin/editcourses/1"),
    );
  });

  test("Delete button calls delete callback", async () => {
    renderTable(coursesFixtures.threeCourses, currentUserFixtures.adminUser);

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    fireEvent.click(deleteButton);

    await waitFor(() => expect(mockMutate).toHaveBeenCalledTimes(1));
    const cellArg = mockMutate.mock.calls[0][0];
    expect(cellArg.row.values.id).toBe(1);
    expect(cellArg.row.values.code).toBe("CMPSC 156");
  });

  test("Supports overriding the testIdPrefix prop", () => {
    renderTable(coursesFixtures.threeCourses, currentUserFixtures.adminUser, {
      testIdPrefix: "CustomCourses",
    });

    expect(screen.getByTestId("CustomCourses-header-code")).toBeInTheDocument();
    expect(
      screen.getByTestId("CustomCourses-cell-row-0-col-code"),
    ).toHaveTextContent("CMPSC 156");
  });

  test("Renders headers even when no courses are provided", () => {
    renderTable([], currentUserFixtures.userOnly);

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });

  test("Hides action buttons when currentUser is null", () => {
    renderTable(coursesFixtures.threeCourses, null);

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(
      expectedHeaders.length,
    );
  });

  test("Configures delete mutation with expected args", () => {
    renderTable(coursesFixtures.threeCourses, currentUserFixtures.adminUser);

    expect(mockUseBackendMutation).toHaveBeenCalledWith(
      cellToAxiosParamsDelete,
      expect.objectContaining({ onSuccess: onDeleteSuccess }),
      ["/api/course/all"],
    );
  });
});
