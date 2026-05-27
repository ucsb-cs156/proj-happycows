import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import AnnouncementForm from "main/components/Announcement/AnnouncementForm";
import { announcementFixtures } from "fixtures/announcementFixtures";
import { ANNOUNCEMENT_TEXT_MAX_LENGTH } from "main/utils/announcementUtils";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi } from "vitest";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("AnnouncementForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["Start Date", "End Date", "Announcement"];
  const testId = "AnnouncementForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnnouncementForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    // Verify form fields are empty when no initialContents provided
    const startDateInput = screen.getByTestId(`${testId}-startDate`);
    const endDateInput = screen.getByTestId(`${testId}-endDate`);
    expect(startDateInput).toHaveValue("");
    expect(endDateInput).toHaveValue("");
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnnouncementForm
            initialContents={announcementFixtures.oneAnnouncement}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();

    // Verify form fields are populated with initialContents data
    await waitFor(() => {
      const startDateInput = screen.getByTestId(`${testId}-startDate`);
      const endDateInput = screen.getByTestId(`${testId}-endDate`);
      const announcementTextInput = screen.getByTestId(
        `${testId}-announcementText`,
      );

      expect(startDateInput).toHaveValue("2024-12-12T00:00");
      expect(endDateInput).toHaveValue("2025-12-12T00:00");
      expect(announcementTextInput).toHaveValue(
        "System maintenance scheduled for next week.",
      );
    });
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnnouncementForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnnouncementForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(
      /Start Date is required and must be provided in ISO format./,
    );
    expect(screen.getByText(/Announcement is required./)).toBeInTheDocument();

    // const endInput = screen.getByTestId(`${testId}-end`);
    // fireEvent.change(endInput, { target: { value: "a" } });
    // fireEvent.click(submitButton);

    // await waitFor(() => {
    //     expect(screen.getByText(/End must be provided in ISO format./)).toBeInTheDocument();
    // });
  });

  test("renders custom button label", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnnouncementForm buttonLabel="Update" />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Update")).toBeInTheDocument();
  });

  test("calls submitAction when form is valid", async () => {
    const mockSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnnouncementForm submitAction={mockSubmit} />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-startDate`), {
      target: { value: "2026-05-17T14:00" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-announcementText`), {
      target: { value: "Hello world" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmit).toHaveBeenCalled());
    expect(mockSubmit.mock.calls[0][0]).toEqual({
      startDate: "2026-05-17T14:00",
      endDate: "",
      announcementText: "Hello world",
    });
  });

  test("calls submitAction with end date when provided", async () => {
    const mockSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnnouncementForm submitAction={mockSubmit} />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-startDate`), {
      target: { value: "2026-05-17T14:00" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-endDate`), {
      target: { value: "2026-12-17T14:00" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-announcementText`), {
      target: { value: "Hello world" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmit).toHaveBeenCalled());
    expect(mockSubmit.mock.calls[0][0]).toEqual({
      startDate: "2026-05-17T14:00",
      endDate: "2026-12-17T14:00",
      announcementText: "Hello world",
    });
  });

  test("invalid start date format shows error", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnnouncementForm />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-startDate`), {
      target: { value: "not-a-date" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-announcementText`), {
      target: { value: "Hello" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText(
        /Start Date is required and must be provided in ISO format./,
      ),
    ).toBeInTheDocument();
  });

  test("that end date equal to start date is invalid", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnnouncementForm />
        </Router>
      </QueryClientProvider>,
    );

    const startInput = screen.getByTestId(`${testId}-startDate`);
    const endInput = screen.getByTestId(`${testId}-endDate`);
    const submitButton = screen.getByText(/Create/);

    fireEvent.change(startInput, { target: { value: "2026-05-17T14:00" } });
    fireEvent.change(endInput, { target: { value: "2026-05-17T14:00" } });
    fireEvent.click(submitButton);

    expect(
      await screen.findByText(/End Date must be after Start Date./),
    ).toBeInTheDocument();
  });

  test("short announcement text is not marked invalid", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnnouncementForm />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-announcementText`), {
      target: { value: "Short announcement" },
    });

    const announcementField = screen.getByTestId(`${testId}-announcementText`);
    expect(announcementField).not.toHaveClass("is-invalid");
    expect(
      screen.queryByText(
        `Announcement must be ${ANNOUNCEMENT_TEXT_MAX_LENGTH} characters or fewer.`,
      ),
    ).not.toBeInTheDocument();
  });

  test("shows max length error when announcement reaches character limit", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnnouncementForm />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-announcementText`), {
      target: { value: "a".repeat(ANNOUNCEMENT_TEXT_MAX_LENGTH) },
    });

    expect(
      await screen.findByText(
        `Announcement must be ${ANNOUNCEMENT_TEXT_MAX_LENGTH} characters or fewer.`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-announcementText`)).toHaveClass(
      "is-invalid",
    );
  });

  test("rejects announcement text longer than max length", async () => {
    const mockSubmit = vi.fn();
    const tooLongText = "a".repeat(ANNOUNCEMENT_TEXT_MAX_LENGTH + 1);

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnnouncementForm submitAction={mockSubmit} />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-startDate`), {
      target: { value: "2026-05-17T14:00" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-announcementText`), {
      target: { value: tooLongText },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText(
        `Announcement must be ${ANNOUNCEMENT_TEXT_MAX_LENGTH} characters or fewer.`,
      ),
    ).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test("that end date must be after start date", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnnouncementForm />
        </Router>
      </QueryClientProvider>,
    );

    const startInput = screen.getByTestId(`${testId}-startDate`);
    const endInput = screen.getByTestId(`${testId}-endDate`);
    const submitButton = screen.getByText(/Create/);

    fireEvent.change(startInput, { target: { value: "2026-05-17T14:00" } });
    fireEvent.change(endInput, { target: { value: "2026-05-17T13:00" } });
    fireEvent.click(submitButton);

    expect(
      await screen.findByText(/End Date must be after Start Date./),
    ).toBeInTheDocument();
  });
});
