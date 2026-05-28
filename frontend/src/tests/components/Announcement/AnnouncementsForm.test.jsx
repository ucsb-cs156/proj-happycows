import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import AnnouncementForm from "main/components/Announcement/AnnouncementForm";
import { announcementFixtures } from "fixtures/announcementFixtures";
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
    expect(screen.getByTestId(`${testId}-startDate`)).toHaveValue(
      "2024-12-12T00:00",
    );
    expect(screen.getByTestId(`${testId}-endDate`)).toHaveValue(
      "2025-12-12T00:00",
    );
  });

  test("renders correctly when initialContents has no dates", async () => {
    const submitAction = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnnouncementForm
            initialContents={{
              ...announcementFixtures.oneAnnouncement,
              startDate: null,
              endDate: undefined,
            }}
            submitAction={submitAction}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-startDate`)).toHaveValue("");
    expect(screen.getByTestId(`${testId}-endDate`)).toHaveValue("");

    fireEvent.click(screen.getByTestId(`${testId}-submit`));
    await waitFor(() => expect(submitAction).toHaveBeenCalled());
    expect(submitAction.mock.calls[0][0]).toMatchObject({
      startDate: "",
      endDate: "",
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

    expect(
      await screen.findByText(/Announcement is required./),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Start Date must be provided in ISO format./),
    ).not.toBeInTheDocument();

    // const endInput = screen.getByTestId(`${testId}-end`);
    // fireEvent.change(endInput, { target: { value: "a" } });
    // fireEvent.click(submitButton);

    // await waitFor(() => {
    //     expect(screen.getByText(/End must be provided in ISO format./)).toBeInTheDocument();
    // });
  });

  test("that startDate pattern validation is performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnnouncementForm />
        </Router>
      </QueryClientProvider>,
    );

    const startDateInput = await screen.findByTestId(`${testId}-startDate`);
    startDateInput.setAttribute("type", "text");
    fireEvent.change(startDateInput, { target: { value: "not-a-date" } });
    fireEvent.change(screen.getByTestId(`${testId}-announcementText`), {
      target: { value: "Hello announcements" },
    });
    fireEvent.click(screen.getByText(/Create/));

    expect(
      await screen.findByText(/Start Date must be provided in ISO format./),
    ).toBeInTheDocument();
  });

  test("startDate is optional when announcementText is provided", async () => {
    const submitAction = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnnouncementForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-announcementText`), {
      target: { value: "Hello announcements" },
    });
    fireEvent.click(screen.getByText(/Create/));

    await waitFor(() => expect(submitAction).toHaveBeenCalled());
    expect(submitAction.mock.calls[0][0]).toMatchObject({
      announcementText: "Hello announcements",
      startDate: "",
      endDate: "",
    });
  });
});
