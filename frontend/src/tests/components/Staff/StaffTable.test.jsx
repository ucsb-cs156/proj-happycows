import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import { staffFixtures } from "fixtures/staffFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import StaffTable from "main/components/Staff/StaffTable";

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

describe("StaffTable tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "StaffTable";
  const expectedHeaders = ["id", "Last Name", "First/Middle Name", "Email"];
  const expectedFields = ["id", "lastName", "firstMiddleName", "email"];

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockToast.mockClear();
    mockUseBackendMutation.mockClear();
  });

  const renderTable = (staff, currentUser, props = {}) => {
    return render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <StaffTable
            staff={staff}
            currentUser={currentUser}
            courseId={1}
            {...props}
          />
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

  test("renders the table flush left, not centered", () => {
    const { container } = renderTable(
      staffFixtures.threeStaff,
      currentUserFixtures.adminUser,
    );

    expect(container.querySelector("table")).toHaveStyle({ margin: "0" });
  });

  test("Modal is not shown initially", async () => {
    renderTable(staffFixtures.threeStaff, currentUserFixtures.adminUser);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });
  });

  test("configures both mutations with the course-scoped query key", () => {
    renderTable(staffFixtures.threeStaff, currentUserFixtures.adminUser);

    expect(mockUseBackendMutation).toHaveBeenCalledTimes(2);
    expect(mockUseBackendMutation.mock.calls[0][2]).toEqual([
      "/api/staff/course/1",
    ]);
    expect(mockUseBackendMutation.mock.calls[1][2]).toEqual([
      "/api/staff/course/1",
    ]);
  });

  test("Exiting the edit modal pop up cancels the edit", async () => {
    renderTable(staffFixtures.threeStaff, currentUserFixtures.adminUser);

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    fireEvent.click(editButton);

    expect(
      await screen.findByTestId(`${testId}-EditModal`),
    ).toBeInTheDocument();
    await screen.findByTestId("StaffForm-lastName");

    // cancelDisabled=true on the edit form: no Cancel button of its own
    expect(screen.queryByTestId("StaffForm-cancel")).not.toBeInTheDocument();

    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    expect(axiosMock.history.put.length).toBe(0);
  });

  test("Edit button opens a pre-filled modal, and submitting PUTs with courseId merged in", async () => {
    axiosMock.onPut("/api/staff/1").reply(200, {
      ...staffFixtures.threeStaff[0],
      lastName: "Smithson",
    });

    renderTable(staffFixtures.threeStaff, currentUserFixtures.adminUser);

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    fireEvent.click(editButton);

    const lastNameField = await screen.findByTestId("StaffForm-lastName");
    expect(lastNameField).toHaveValue("Smith");

    fireEvent.change(lastNameField, { target: { value: "Smithson" } });
    fireEvent.click(screen.getByTestId("StaffForm-submit"));

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    expect(axiosMock.history.put[0].url).toBe("/api/staff/1");
    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
      id: 1,
      lastName: "Smithson",
      firstMiddleName: "Jordan",
      email: "jordansmith@ucsb.edu",
      courseId: 1,
    });

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        "Staff member updated successfully.",
      ),
    );

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });
  });

  test("Delete button calls delete callback", async () => {
    axiosMock.onDelete("/api/staff/1").reply(200, {
      message: "Staff with id 1 deleted",
    });

    renderTable(staffFixtures.threeStaff, currentUserFixtures.adminUser);

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    fireEvent.click(deleteButton);

    const confirmDeleteButton = await screen.getByTestId(
      `${testId}-Modal-Delete`,
    );

    fireEvent.click(confirmDeleteButton);

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].url).toBe("/api/staff/1");

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith({
        message: "Staff with id 1 deleted",
      }),
    );

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

    expect(axiosMock.history.delete.length).toBe(0);
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

    expect(axiosMock.history.delete.length).toBe(0);
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
});
