import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { setupServer } from "msw/node";

import DashboardPageStoriesMeta, {
  AdminView,
  StudentViewAllSectionsShown,
  StudentViewSomeSectionsShown,
  StudentViewNotAuthorized,
  Loading,
} from "../../../stories/pages/DashboardPage.stories";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const allSectionTestIds = [
  "DashboardPage-OverviewSection",
  "DashboardPage-CowsPerFarmerSection",
  "DashboardPage-CapacitySection",
  "DashboardPage-HistogramSection",
  "DashboardPage-TrendsSection",
  "DashboardPage-HealthSection",
  "DashboardPage-TotalCowsSection",
  "DashboardPage-LeaderboardSection",
];

// Renders a story against the given QueryClient, registering that story's
// own declared msw handlers - mirroring how msw-storybook-addon actually
// activates a story's `parameters.msw` in the real Storybook preview.
const renderStory = (queryClient, Story) => {
  server.use(...Story.parameters.msw);
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("DashboardPage stories", () => {
  test("exposes the expected five scenarios", () => {
    expect(DashboardPageStoriesMeta.title).toBe("pages/DashboardPage");
    expect(AdminView.parameters.msw.length).toBeGreaterThan(0);
    expect(StudentViewAllSectionsShown.parameters.msw.length).toBeGreaterThan(
      0,
    );
    expect(StudentViewSomeSectionsShown.parameters.msw.length).toBeGreaterThan(
      0,
    );
    expect(StudentViewNotAuthorized.parameters.msw.length).toBeGreaterThan(0);
    expect(Loading.parameters.msw.length).toBeGreaterThan(0);
  });

  test("AdminView shows populated data and admin controls", async () => {
    renderStory(new QueryClient(), AdminView);

    expect(await screen.findByText("Sample Game")).toBeInTheDocument();
    expect(
      screen.getByTestId("DashboardPage-admin-controls"),
    ).toBeInTheDocument();
    for (const testid of allSectionTestIds) {
      expect(screen.getByTestId(testid)).toBeInTheDocument();
    }
    expect(await screen.findByText("one")).toBeInTheDocument();
  });

  test("StudentViewAllSectionsShown shows every section to a student, with no admin controls", async () => {
    renderStory(new QueryClient(), StudentViewAllSectionsShown);

    expect(await screen.findByText("Sample Game")).toBeInTheDocument();
    expect(
      screen.queryByTestId("DashboardPage-admin-controls"),
    ).not.toBeInTheDocument();
    for (const testid of allSectionTestIds) {
      expect(await screen.findByTestId(testid)).toBeInTheDocument();
    }
  });

  test("StudentViewSomeSectionsShown hides the sections the game turned off", async () => {
    renderStory(new QueryClient(), StudentViewSomeSectionsShown);

    expect(
      await screen.findByTestId("DashboardPage-OverviewSection"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("DashboardPage-LeaderboardSection"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("DashboardPage-CowsPerFarmerSection"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("DashboardPage-CapacitySection"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("DashboardPage-HistogramSection"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("DashboardPage-TrendsSection"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("DashboardPage-HealthSection"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("DashboardPage-TotalCowsSection"),
    ).not.toBeInTheDocument();
  });

  test("StudentViewNotAuthorized shows only the not-authorized message", async () => {
    renderStory(new QueryClient(), StudentViewNotAuthorized);

    expect(
      await screen.findByText("You're not authorized to see the dashboard."),
    ).toBeInTheDocument();
    for (const testid of allSectionTestIds) {
      expect(screen.queryByTestId(testid)).not.toBeInTheDocument();
    }
  });

  test("Loading shows the loading state and stays there", async () => {
    renderStory(new QueryClient(), Loading);

    expect(await screen.findByText("Loading...")).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  // Regression test: Storybook's global decorator (.storybook/preview.jsx)
  // gives every story the SAME QueryClient instance for the whole session,
  // and useBackend's query keys are derived from the game id in the route.
  // If two stories simulated the same id, switching from a populated story
  // to Loading in a live Storybook session would incorrectly show the
  // previous story's cached data instead of a loading state. Each story
  // above uses a distinct id specifically to prevent this; this test
  // exercises that scenario end-to-end against one shared client.
  test("switching stories against a shared QueryClient does not leak cached data into Loading", async () => {
    const sharedQueryClient = new QueryClient();

    const { unmount } = renderStory(sharedQueryClient, AdminView);
    expect(await screen.findByText("Sample Game")).toBeInTheDocument();
    unmount();

    renderStory(sharedQueryClient, Loading);
    expect(await screen.findByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Sample Game")).not.toBeInTheDocument();
  });
});
