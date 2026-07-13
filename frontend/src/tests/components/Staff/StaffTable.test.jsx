import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";

import { staffFixtures } from "fixtures/staffFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import StaffTable from "main/components/Staff/StaffTable";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/staffUtils";

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

describe("StaffTable tests", () => {
  const queryClient = new QueryClient();
  const testId = "StaffTable";
  const expectedHeaders = [
    "id",
    "Last Name",
    "First/Middle Name",
    "Email",
    "Course Id",
  ];
  const expectedFields = [
    "id",
    "lastName",
    "firstMiddleName",
    "email",
    "courseId",
  ];

  beforeEach(() => {
    mockMutate.mockReset();
    mockUseBackendMutation.mockReset();
    mockUseBackendMutation.mockReturnValue({ mutate: mockMutate });
    mockedNavigate.mockClear();
  });

  const renderTable = (staff, currentUser, props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StaffTable staff={staff} currentUser={currentUser} {...props} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("Has the expected column headers and content for ordinary user", () => {
    renderTable(staffFixtures.threeStaff, currentUserFixtures.userOnly);

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("Has the expected column headers and content for admin user", () => {
    renderTable(staffFixtures.threeStaff, currentUserFixtures.adminUser);

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

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
    renderTable(staffFixtures.threeStaff, currentUserFixtures.adminUser);

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/admin/editstaff/1"),
    );
  });

  test("Delete button calls delete callback", async () => {
    renderTable(staffFixtures.threeStaff, currentUserFixtures.adminUser);

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    fireEvent.click(deleteButton);

    const confirmDeleteButton = await screen.getByTestId(
      `${testId}-Modal-Delete`,
    );

    fireEvent.click(confirmDeleteButton);

    await waitFor(() => expect(mockMutate).toHaveBeenCalledTimes(1));
    const cellArg = mockMutate.mock.calls[0][0];
    expect(cellArg.row.values.id).toBe(1);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });
  });

  test("Pressing Keep this Staff Member in Modal cancels the deletion", async () => {
    renderTable(staffFixtures.threeStaff, currentUserFixtures.adminUser);

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    fireEvent.click(deleteButton);

    const cancelDeleteButton = await screen.getByTestId(
      `${testId}-Modal-Cancel`,
    );

    fireEvent.click(cancelDeleteButton);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  test("Exiting the modal pop up cancels the deletion", async () => {
    renderTable(staffFixtures.threeStaff, currentUserFixtures.adminUser);

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    fireEvent.click(deleteButton);

    const closeButton = await screen.getByLabelText("Close");

    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  test("Renders headers even when no staff are provided", () => {
    renderTable([], currentUserFixtures.userOnly);

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });

  test("Hides action buttons when currentUser is null", () => {
    renderTable(staffFixtures.threeStaff, null);

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
    renderTable(staffFixtures.threeStaff, currentUserFixtures.adminUser);

    expect(mockUseBackendMutation).toHaveBeenCalledWith(
      cellToAxiosParamsDelete,
      expect.objectContaining({ onSuccess: onDeleteSuccess }),
      ["/api/staff/all"],
    );
  });
});
