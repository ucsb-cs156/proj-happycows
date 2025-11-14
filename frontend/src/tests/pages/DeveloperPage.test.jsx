import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import DeveloperPage from "main/pages/DeveloperPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("DeveloperPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
  });

  afterEach(() => {
    axiosMock.restore();
  });

  const queryClient = new QueryClient();

  test("renders without crashing when system info has source repo", async () => {
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingAll);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DeveloperPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("Developer Info")).toBeInTheDocument();
    expect(await screen.findByText("System Information")).toBeInTheDocument();
    expect(await screen.findByText("Source Code:")).toBeInTheDocument();
    expect(await screen.findByTestId("developer-page-source-link")).toBeInTheDocument();
    expect(await screen.findByTestId("developer-page-system-info")).toBeInTheDocument();
  });

  test("renders correctly when system info has no source repo", async () => {
    const systemInfoWithoutRepo = {
      ...systemInfoFixtures.showingAll,
      sourceRepo: null
    };

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoWithoutRepo);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DeveloperPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("Developer Info")).toBeInTheDocument();
    expect(await screen.findByText("System Information")).toBeInTheDocument();
    expect(screen.queryByText("Source Code:")).not.toBeInTheDocument();
    expect(screen.queryByTestId("developer-page-source-link")).not.toBeInTheDocument();
    expect(await screen.findByTestId("developer-page-system-info")).toBeInTheDocument();
  });

  test("source link has correct href when source repo is present", async () => {
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingAll);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DeveloperPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const sourceLink = await screen.findByTestId("developer-page-source-link");
    expect(sourceLink).toHaveAttribute("href", systemInfoFixtures.showingAll.sourceRepo);
    expect(sourceLink).toHaveAttribute("target", "_blank");
    expect(sourceLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
