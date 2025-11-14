import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import DeveloperPage from "main/pages/DeveloperPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("DeveloperPage tests", () => {
  let queryClient;
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    queryClient = new QueryClient();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingAll);
  });

  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DeveloperPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Developer Info")).toBeInTheDocument();
    expect(await screen.findByText("System Information")).toBeInTheDocument();
    expect(await screen.findByText("Source Code:")).toBeInTheDocument();
    expect(
      await screen.findByTestId("developer-page-source-link"),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("developer-page-system-info"),
    ).toBeInTheDocument();
  });

  test("source link has correct attributes with valid systemInfo", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DeveloperPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const sourceLink = await screen.findByTestId("developer-page-source-link");
    expect(sourceLink).toHaveAttribute(
      "href",
      systemInfoFixtures.showingAll.sourceRepo,
    );
    expect(sourceLink).toHaveAttribute("target", "_blank");
    expect(sourceLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(sourceLink).toHaveTextContent(
      systemInfoFixtures.showingAll.sourceRepo,
    );
  });

  test("renders correctly when systemInfo is null", async () => {
    axiosMock.reset();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock.onGet("/api/systemInfo").reply(200, null);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DeveloperPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Developer Info")).toBeInTheDocument();
    expect(await screen.findByText("System Information")).toBeInTheDocument();
    const sourceLink = await screen.findByTestId("developer-page-source-link");
    expect(sourceLink).toBeInTheDocument();
    expect(sourceLink).toHaveTextContent("");
    expect(sourceLink.getAttribute("href")).toBeNull();
    expect(
      await screen.findByTestId("developer-page-system-info"),
    ).toBeInTheDocument();
  });

  test("renders correctly when systemInfo has undefined sourceRepo", async () => {
    const systemInfoWithoutRepo = { ...systemInfoFixtures.showingAll };
    delete systemInfoWithoutRepo.sourceRepo;

    axiosMock.reset();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock.onGet("/api/systemInfo").reply(200, systemInfoWithoutRepo);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DeveloperPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Developer Info")).toBeInTheDocument();
    expect(await screen.findByText("System Information")).toBeInTheDocument();
    const sourceLink = await screen.findByTestId("developer-page-source-link");
    expect(sourceLink).toBeInTheDocument();
    expect(sourceLink).toHaveTextContent("");
    expect(sourceLink.getAttribute("href")).toBeNull();
    expect(
      await screen.findByTestId("developer-page-system-info"),
    ).toBeInTheDocument();
  });

  test("renders correctly when systemInfo has empty sourceRepo", async () => {
    const systemInfoWithEmptyRepo = {
      ...systemInfoFixtures.showingAll,
      sourceRepo: "",
    };

    axiosMock.reset();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock.onGet("/api/systemInfo").reply(200, systemInfoWithEmptyRepo);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DeveloperPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Developer Info")).toBeInTheDocument();
    expect(await screen.findByText("System Information")).toBeInTheDocument();
    const sourceLink = await screen.findByTestId("developer-page-source-link");
    expect(sourceLink).toBeInTheDocument();
    expect(sourceLink).toHaveTextContent("");
    expect(sourceLink).toHaveAttribute("href", "");
    expect(
      await screen.findByTestId("developer-page-system-info"),
    ).toBeInTheDocument();
  });
});
