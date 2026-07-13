import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import StaffTabComponent from "main/components/Staff/StaffTabComponent";
import { staffFixtures } from "fixtures/staffFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("StaffTabComponent tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockToast.mockClear();
    axiosMock.onGet("/api/staff/course/1").reply(200, staffFixtures.threeStaff);
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <StaffTabComponent
            courseId={1}
            currentUser={currentUserFixtures.adminUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  test("renders the staff table", async () => {
    renderComponent();

    expect(
      await screen.findByTestId("StaffTable-cell-row-0-col-id"),
    ).toBeInTheDocument();
  });

  test("Exiting the add-staff modal cancels the add", async () => {
    renderComponent();

    fireEvent.click(await screen.findByTestId("StaffTabComponent-add-button"));
    await screen.findByTestId("StaffForm-lastName");

    fireEvent.click(screen.getByLabelText("Close"));

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });
    expect(axiosMock.history.post.length).toBe(0);
  });

  test("Exiting the CSV upload modal cancels the upload", async () => {
    renderComponent();

    fireEvent.click(await screen.findByTestId("StaffTabComponent-csv-button"));
    await screen.findByTestId("StaffCSVUploadForm-upload");

    fireEvent.click(screen.getByLabelText("Close"));

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });
    expect(axiosMock.history.post.length).toBe(0);
  });

  test("Add Individual Staff Member opens a modal and posts the new staff member with courseId", async () => {
    axiosMock.onPost("/api/staff").reply(200, staffFixtures.oneStaff[0]);

    renderComponent();

    fireEvent.click(await screen.findByTestId("StaffTabComponent-add-button"));

    fireEvent.change(await screen.findByTestId("StaffForm-lastName"), {
      target: { value: "Smith" },
    });
    fireEvent.change(screen.getByTestId("StaffForm-firstMiddleName"), {
      target: { value: "Jordan" },
    });
    fireEvent.change(screen.getByTestId("StaffForm-email"), {
      target: { value: "jordansmith@ucsb.edu" },
    });
    fireEvent.click(screen.getByTestId("StaffForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].url).toBe("/api/staff");
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      lastName: "Smith",
      firstMiddleName: "Jordan",
      email: "jordansmith@ucsb.edu",
      courseId: 1,
    });

    expect(mockToast).toHaveBeenCalledWith("Staff member added successfully.");
  });

  test("uploading a CSV posts the file with courseId and shows a summary toast", async () => {
    axiosMock
      .onPost("/api/staff/upload/csv")
      .reply(200, { created: 2, skippedEmails: ["dup@ucsb.edu"] });

    renderComponent();

    fireEvent.click(await screen.findByTestId("StaffTabComponent-csv-button"));

    const file = new File(["lastName,firstMiddleName,email"], "staff.csv", {
      type: "text/csv",
    });
    const input = await screen.findByTestId("StaffCSVUploadForm-upload");
    await userEvent.upload(input, file);
    fireEvent.click(screen.getByTestId("StaffCSVUploadForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].url).toBe("/api/staff/upload/csv");
    expect(axiosMock.history.post[0].params).toEqual({ courseId: 1 });

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        "Roster uploaded: 2 staff member(s) added, 1 skipped (already on roster).",
      ),
    );
  });

  test("uploading a CSV with no skipped rows shows a summary toast without a skipped clause", async () => {
    axiosMock
      .onPost("/api/staff/upload/csv")
      .reply(200, { created: 3, skippedEmails: [] });

    renderComponent();

    fireEvent.click(await screen.findByTestId("StaffTabComponent-csv-button"));

    const file = new File(["lastName,firstMiddleName,email"], "staff.csv", {
      type: "text/csv",
    });
    const input = await screen.findByTestId("StaffCSVUploadForm-upload");
    await userEvent.upload(input, file);
    fireEvent.click(screen.getByTestId("StaffCSVUploadForm-submit"));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        "Roster uploaded: 3 staff member(s) added.",
      ),
    );
  });
});
