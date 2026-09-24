import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Routes } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminJobLogPage from "main/pages/AdminJobLogPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

describe("AdminJobLogPage tests", () => {
  let queryClient = new QueryClient();
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    queryClient = new QueryClient();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
  });

  const renderPage = (id) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/admin/jobs/logs/${id}`]}>
          <Routes>
            <Route path="/admin/jobs/logs/:id" element={<AdminJobLogPage />} />
            <Route path="/admin/jobs" element={<p>Admin Jobs Page stub</p>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

  test("fetches and renders the full log for the job in the URL", async () => {
    axiosMock
      .onGet("/api/jobs/logs/7")
      .reply(200, "Starting to milk the cows\nCows have been milked!");

    renderPage(7);

    expect(screen.getByText("Log for Job 7")).toBeInTheDocument();
    expect(screen.getByTestId("AdminJobLogPage-loading")).toHaveTextContent(
      "Loading...",
    );

    const log = await screen.findByTestId("AdminJobLogPage-log");
    expect(log).toHaveTextContent("Starting to milk the cows");
    expect(log).toHaveTextContent("Cows have been milked!");
    expect(
      screen.queryByTestId("AdminJobLogPage-loading"),
    ).not.toBeInTheDocument();

    await waitFor(() =>
      expect(axiosMock.history.get.length).toBeGreaterThan(0),
    );
    expect(
      axiosMock.history.get.map((r) => r.url).includes("/api/jobs/logs/7"),
    ).toBe(true);
  });

  test("renders an empty log (job that never logged anything)", async () => {
    axiosMock.onGet("/api/jobs/logs/8").reply(200, "");

    renderPage(8);

    const log = await screen.findByTestId("AdminJobLogPage-log");
    expect(log).toHaveTextContent("");
  });

  test("Back to Job List button navigates to the jobs page", async () => {
    axiosMock.onGet("/api/jobs/logs/7").reply(200, "line");

    renderPage(7);

    fireEvent.click(screen.getByTestId("AdminJobLogPage-back-button"));

    expect(await screen.findByText("Admin Jobs Page stub")).toBeInTheDocument();
  });
});
