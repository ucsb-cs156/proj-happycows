import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import StudentsTabComponent from "main/components/Students/StudentsTabComponent";
import { studentsFixtures } from "fixtures/studentsFixtures";
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

describe("StudentsTabComponent tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockToast.mockClear();
    axiosMock
      .onGet("/api/student/course/1")
      .reply(200, studentsFixtures.threeStudents);
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <StudentsTabComponent
            courseId={1}
            currentUser={currentUserFixtures.adminUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  test("renders the roster table", async () => {
    renderComponent();

    expect(
      await screen.findByTestId("StudentsTable-cell-row-0-col-id"),
    ).toBeInTheDocument();
  });

  test("Exiting the add-student modal cancels the add", async () => {
    renderComponent();

    fireEvent.click(
      await screen.findByTestId("StudentsTabComponent-add-button"),
    );
    await screen.findByTestId("StudentsForm-lastName");

    fireEvent.click(screen.getByLabelText("Close"));

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });
    expect(axiosMock.history.post.length).toBe(0);
  });

  test("Exiting the CSV upload modal cancels the upload", async () => {
    renderComponent();

    fireEvent.click(
      await screen.findByTestId("StudentsTabComponent-csv-button"),
    );
    await screen.findByTestId("StudentsCSVUploadForm-upload");

    fireEvent.click(screen.getByLabelText("Close"));

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });
    expect(axiosMock.history.post.length).toBe(0);
  });

  test("Add Individual Student opens a modal and posts the new student with courseId", async () => {
    axiosMock.onPost("/api/student").reply(200, studentsFixtures.oneStudent[0]);

    renderComponent();

    fireEvent.click(
      await screen.findByTestId("StudentsTabComponent-add-button"),
    );

    fireEvent.change(await screen.findByTestId("StudentsForm-lastName"), {
      target: { value: "Ferber" },
    });
    fireEvent.change(screen.getByTestId("StudentsForm-firstMiddleName"), {
      target: { value: "Sally" },
    });
    fireEvent.change(screen.getByTestId("StudentsForm-email"), {
      target: { value: "sallyferber@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId("StudentsForm-perm"), {
      target: { value: "1234567" },
    });
    fireEvent.click(screen.getByTestId("StudentsForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].url).toBe("/api/student");
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      lastName: "Ferber",
      firstMiddleName: "Sally",
      email: "sallyferber@ucsb.edu",
      perm: "1234567",
      courseId: 1,
    });

    expect(mockToast).toHaveBeenCalledWith("Student added successfully.");
  });

  test("uploading a CSV posts the file with courseId and shows a summary toast", async () => {
    axiosMock
      .onPost("/api/student/upload/csv")
      .reply(200, { created: 2, skippedEmails: ["dup@ucsb.edu"] });

    renderComponent();

    fireEvent.click(
      await screen.findByTestId("StudentsTabComponent-csv-button"),
    );

    const file = new File(
      ["lastName,firstMiddleName,email,perm"],
      "roster.csv",
      { type: "text/csv" },
    );
    const input = await screen.findByTestId("StudentsCSVUploadForm-upload");
    await userEvent.upload(input, file);
    fireEvent.click(screen.getByTestId("StudentsCSVUploadForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].url).toBe("/api/student/upload/csv");
    expect(axiosMock.history.post[0].params).toEqual({ courseId: 1 });

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        "Roster uploaded: 2 student(s) added, 1 skipped (already on roster).",
      ),
    );
  });

  test("uploading a CSV with no skipped rows shows a summary toast without a skipped clause", async () => {
    axiosMock
      .onPost("/api/student/upload/csv")
      .reply(200, { created: 3, skippedEmails: [] });

    renderComponent();

    fireEvent.click(
      await screen.findByTestId("StudentsTabComponent-csv-button"),
    );

    const file = new File(
      ["lastName,firstMiddleName,email,perm"],
      "roster.csv",
      { type: "text/csv" },
    );
    const input = await screen.findByTestId("StudentsCSVUploadForm-upload");
    await userEvent.upload(input, file);
    fireEvent.click(screen.getByTestId("StudentsCSVUploadForm-submit"));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        "Roster uploaded: 3 student(s) added.",
      ),
    );
  });
});
