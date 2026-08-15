import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { setupServer } from "msw/node";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import timeSeriesFixtures from "fixtures/timeSeriesFixtures";
import DashboardPageStoryMeta, {
  AdminView as AdminViewStory,
  StudentView as StudentViewStory,
  StudentViewNotAuthorized as StudentViewNotAuthorizedStory,
  Loading as LoadingStory,
} from "../../../stories/pages/DashboardPage.stories";

describe("DashboardPage stories", () => {
  let axiosMock;

  const renderStory = (Story) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin/dashboard/1"]}>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  afterEach(() => {
    axiosMock?.restore();
  });

  test("stories expose expected metadata", () => {
    expect(DashboardPageStoryMeta.title).toBe("pages/DashboardPage");
    expect(DashboardPageStoryMeta.component).toBeTruthy();
  });

  test("AdminView story renders populated dashboard data, not just Loading", async () => {
    axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/game/plus").reply(200, {
      game: {
        id: 1,
        name: "Sample Game",
        showLeaderboard: true,
        showOverviewSection: true,
        showCowsPerFarmerSection: true,
        showHistogramSection: true,
        showTrendsSection: true,
        showHealthSection: true,
        showTotalCowsSection: true,
        showFarmerLeaderboardSection: true,
      },
      totalUsers: 7,
      totalCows: 55,
      averageCowsPerFarmer: 7.86,
      medianCowsPerFarmer: 7,
      minimumCowsPerFarmer: 1,
      maximumCowsPerFarmer: 20,
      standardDeviationCowsPerFarmer: 6.23,
    });
    axiosMock.onGet("/api/game/numcows").reply(200, [1, 2, 3, 5, 10, 15, 20]);
    axiosMock
      .onGet("/api/game/timeseries")
      .reply(200, timeSeriesFixtures.timeSeriesBigExample);
    axiosMock.onGet("/api/farmer/game/all").reply(200, []);

    renderStory(AdminViewStory);

    expect(await screen.findByText("Sample Game")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(screen.getByText("55")).toBeInTheDocument();
  });

  test("Loading story stays in the loading state", async () => {
    axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/game/plus").timeout();

    renderStory(LoadingStory);

    expect(await screen.findByText("Loading...")).toBeInTheDocument();
  });

  test("StudentView and StudentViewNotAuthorized stories are defined", () => {
    expect(StudentViewStory.parameters.msw).toBeTruthy();
    expect(StudentViewNotAuthorizedStory.parameters.msw).toBeTruthy();
  });

  describe.each([
    ["AdminView", AdminViewStory],
    ["StudentView", StudentViewStory],
    ["StudentViewNotAuthorized", StudentViewNotAuthorizedStory],
    ["Loading", LoadingStory],
  ])("%s story's own MSW handlers", (name, Story) => {
    test("cover every API request the page makes (no unhandled requests)", async () => {
      const server = setupServer(...Story.parameters.msw);
      server.listen({ onUnhandledRequest: "error" });

      try {
        renderStory(Story);

        // Wait for the page to settle into either its loaded or loading state
        // so that every enabled useBackend request has had a chance to fire.
        await waitFor(() => {
          expect(
            screen.getByText(/Loading\.\.\.|You're not authorized|Dashboard/),
          ).toBeInTheDocument();
        });
      } finally {
        server.close();
      }
    });
  });
});
