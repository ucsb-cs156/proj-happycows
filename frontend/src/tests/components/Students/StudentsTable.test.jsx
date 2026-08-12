import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import { studentsFixtures } from "fixtures/studentsFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import StudentsTable from "main/components/Students/StudentsTable";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

const { mockUseBackendMutation } = vi.hoisted(() => {
  return { mockUseBackendMutation: vi.fn() };
});

vi.mock("main/utils/useBackend", async (importOriginal) => {
  const actual = await importOriginal();
  mockUseBackendMutation.mockImplementation((...args) =>
    actual.useBackendMutation(...args),
  );
  return {
    ...actual,
    useBackendMutation: (...args) => mockUseBackendMutation(...args),
  };
});

describe("StudentsTable tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "StudentsTable";
  const expectedHeaders = [
    "id",
    "Last Name",
    "First/Middle Name",
    "Email",
    "Perm",
    "Last Login",
  ];
  const expectedFields = [
    "id",
    "lastName",
    "firstMiddleName",
    "email",
    "perm",
    "lastLoginDateTime",
  ];

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockToast.mockClear();
    mockUseBackendMutation.mockClear();
  });

  const renderTable = (students, currentUser, props = {}) => {
    return render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <StudentsTable
            students={students}
            currentUser={currentUser}
            courseId={1}
            {...props}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("Has the expected column headers and content for ordinary user", () => {
    renderTable(studentsFixtures.threeStudents, currentUserFixtures.userOnly);

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

  test("displays formatted last login time, and 'Never' when null", async () => {
    renderTable(studentsFixtures.threeStudents, currentUserFixtures.userOnly);

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-lastLoginDateTime`),
    ).toHaveTextContent("Never");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-lastLoginDateTime`),
    ).not.toHaveTextContent("Never");
  });

  test("sorts Last Login column by underlying timestamp, not rendered text", async () => {
    const now = new Date();
    const minutesAgo = (minutes) =>
      new Date(now.getTime() - minutes * 60 * 1000).toISOString();

    // Rendered text for these would sort as "15 minutes ago", "2 minutes ago",
    // "42 minutes ago" lexicographically, which is not chronological order.
    const students = [
      {
        ...studentsFixtures.threeStudents[0],
        id: 1,
        lastLoginDateTime: minutesAgo(15),
      },
      {
        ...studentsFixtures.threeStudents[1],
        id: 2,
        lastLoginDateTime: minutesAgo(2),
      },
      {
        ...studentsFixtures.threeStudents[2],
        id: 3,
        lastLoginDateTime: minutesAgo(42),
      },
    ];

    renderTable(students, currentUserFixtures.userOnly);

    const header = screen.getByTestId(`${testId}-header-lastLoginDateTime`);

    const getVisibleIdOrder = () =>
      screen
        .getAllByRole("row")
        .slice(1) // skip header row
        .map((row) => row.querySelector("td").textContent);

    // Click once to sort ascending (oldest lastLoginDateTime first, i.e. most minutes ago).
    fireEvent.click(header);

    await waitFor(() => {
      expect(getVisibleIdOrder()).toEqual(["3", "1", "2"]);
    });

    // Click again to sort descending (most recent lastLoginDateTime first).
    fireEvent.click(header);

    await waitFor(() => {
      expect(getVisibleIdOrder()).toEqual(["2", "1", "3"]);
    });
  });

  test("Has the expected column headers and content for admin user", () => {
    renderTable(studentsFixtures.threeStudents, currentUserFixtures.adminUser);

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

  test("renders the table flush left, not centered", () => {
    const { container } = renderTable(
      studentsFixtures.threeStudents,
      currentUserFixtures.adminUser,
    );

    expect(container.querySelector("table")).toHaveStyle({ margin: "0" });
  });

  test("Modal is not shown initially", async () => {
    renderTable(studentsFixtures.threeStudents, currentUserFixtures.adminUser);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });
  });

  test("configures both mutations with the course-scoped query key", () => {
    renderTable(studentsFixtures.threeStudents, currentUserFixtures.adminUser);

    expect(mockUseBackendMutation).toHaveBeenCalledTimes(2);
    expect(mockUseBackendMutation.mock.calls[0][2]).toEqual([
      "/api/student/course/1",
    ]);
    expect(mockUseBackendMutation.mock.calls[1][2]).toEqual([
      "/api/student/course/1",
    ]);
  });

  test("Exiting the edit modal pop up cancels the edit", async () => {
    renderTable(studentsFixtures.threeStudents, currentUserFixtures.adminUser);

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    fireEvent.click(editButton);

    expect(
      await screen.findByTestId(`${testId}-EditModal`),
    ).toBeInTheDocument();
    await screen.findByTestId("StudentsForm-lastName");

    // cancelDisabled=true on the edit form: no Cancel button of its own
    expect(screen.queryByTestId("StudentsForm-cancel")).not.toBeInTheDocument();

    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    expect(axiosMock.history.put.length).toBe(0);
  });

  test("Edit button opens a pre-filled modal, and submitting PUTs with courseId merged in", async () => {
    axiosMock.onPut("/api/student/1").reply(200, {
      ...studentsFixtures.threeStudents[0],
      lastName: "Ferberson",
    });

    renderTable(studentsFixtures.threeStudents, currentUserFixtures.adminUser);

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    fireEvent.click(editButton);

    const lastNameField = await screen.findByTestId("StudentsForm-lastName");
    expect(lastNameField).toHaveValue("Ferber");

    fireEvent.change(lastNameField, { target: { value: "Ferberson" } });
    fireEvent.click(screen.getByTestId("StudentsForm-submit"));

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    expect(axiosMock.history.put[0].url).toBe("/api/student/1");
    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
      id: 1,
      lastName: "Ferberson",
      firstMiddleName: "Sally",
      email: "sallyferber@ucsb.edu",
      perm: "1234567",
      courseId: 1,
      lastLoginDateTime: "2024-01-15T10:15:30",
    });

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith("Student updated successfully."),
    );

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });
  });

  test("Delete button calls delete callback", async () => {
    axiosMock.onDelete("/api/student/1").reply(200, {
      message: "Student with id 1 deleted",
    });

    renderTable(studentsFixtures.threeStudents, currentUserFixtures.adminUser);

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    fireEvent.click(deleteButton);

    const confirmDeleteButton = await screen.getByTestId(
      `${testId}-Modal-Delete`,
    );

    fireEvent.click(confirmDeleteButton);

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].url).toBe("/api/student/1");

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith({
        message: "Student with id 1 deleted",
      }),
    );

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });
  });

  test("Pressing Keep this Student in Modal cancels the deletion", async () => {
    renderTable(studentsFixtures.threeStudents, currentUserFixtures.adminUser);

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

    expect(axiosMock.history.delete.length).toBe(0);
  });

  test("Exiting the modal pop up cancels the deletion", async () => {
    renderTable(studentsFixtures.threeStudents, currentUserFixtures.adminUser);

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    fireEvent.click(deleteButton);

    const closeButton = await screen.getByLabelText("Close");

    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    expect(axiosMock.history.delete.length).toBe(0);
  });

  test("Renders headers even when no students are provided", () => {
    renderTable([], currentUserFixtures.userOnly);

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });

  test("Hides action buttons when currentUser is null", () => {
    renderTable(studentsFixtures.threeStudents, null);

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

  const manyStudents = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    lastName: `Last${i + 1}`,
    firstMiddleName: `First${i + 1}`,
    email: `student${i + 1}@ucsb.edu`,
    perm: `100000${i}`,
    courseId: 1,
    lastLoginDateTime: null,
  }));

  test("renders a Page Size selector defaulting to 20", () => {
    renderTable(manyStudents, currentUserFixtures.userOnly);

    const selector = screen.getByTestId(`${testId}-page-size-selector`);
    expect(selector).toBeInTheDocument();
    expect(selector).toHaveValue("20");
  });

  test("with more students than the page size, pagination is shown and only a page's worth of rows render", () => {
    renderTable(manyStudents, currentUserFixtures.userOnly);

    expect(
      screen.getByTestId(`${testId}-current-page-button`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-id`),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-20-col-id`),
    ).not.toBeInTheDocument();
  });

  test("selecting a larger page size shows all rows and hides pagination", async () => {
    renderTable(manyStudents, currentUserFixtures.userOnly);

    const selector = screen.getByTestId(`${testId}-page-size-selector`);
    fireEvent.change(selector, { target: { value: "50" } });

    await waitFor(() => {
      expect(
        screen.queryByTestId(`${testId}-current-page-button`),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByTestId(`${testId}-cell-row-24-col-id`),
    ).toBeInTheDocument();
  });
});
