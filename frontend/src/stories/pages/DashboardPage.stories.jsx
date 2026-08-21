import React from "react";
import { Route, Routes } from "react-router";
import DashboardPage from "main/pages/DashboardPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import timeSeriesFixtures from "fixtures/timeSeriesFixtures";
import leaderboardFixtures from "fixtures/leaderboardFixtures";

import { delay, http, HttpResponse } from "msw";

export default {
  title: "pages/DashboardPage",
  component: DashboardPage,
};

// Storybook's global QueryClientProvider (see .storybook/preview.jsx) uses a
// single QueryClient instance for the whole Storybook session, and
// useBackend's query keys are derived from the game id in the route (e.g.
// `/api/game/plus?id=1`). If every story here simulated the same route/id,
// switching between stories in the Storybook UI would show data left over
// in the cache from whichever story was viewed first, rather than the
// story's own mocked data. Giving every story a distinct id avoids that.
const pathForId = (id) => `/admin/dashboard/${id}`;

const makeTemplate = (id) => {
  function Template() {
    return (
      <Routes location={pathForId(id)}>
        <Route path="/admin/dashboard/:id" element={<DashboardPage />} />
      </Routes>
    );
  }
  return Template;
};

const baseGame = {
  id: 1,
  name: "Sample Game",
  showLeaderboard: true,
  showOverviewSection: true,
  showCowsPerFarmerSection: true,
  showCapacitySection: true,
  showHistogramSection: true,
  showTrendsSection: true,
  showHealthSection: true,
  showTotalCowsSection: true,
  showCapacityOverTimeSection: true,
  showFarmerLeaderboardSection: true,
};

const baseGamePlus = {
  totalUsers: 7,
  totalCows: 55,
  effectiveCapacity: 70,
  averageCowsPerFarmer: 7.86,
  medianCowsPerFarmer: 7,
  minimumCowsPerFarmer: 1,
  maximumCowsPerFarmer: 20,
  standardDeviationCowsPerFarmer: 6.23,
  averageCowHealth: 82.4,
};

const populatedMswHandlers = (game) => [
  http.get("/api/game/plus", () => {
    return HttpResponse.json({ game, ...baseGamePlus }, { status: 200 });
  }),
  http.get("/api/game/numcows", () =>
    HttpResponse.json([1, 2, 3, 5, 10, 15, 20], { status: 200 }),
  ),
  http.get("/api/game/timeseries", () =>
    HttpResponse.json(timeSeriesFixtures.timeSeriesBigExample, {
      status: 200,
    }),
  ),
  http.get("/api/farmer/game/all", () =>
    HttpResponse.json(leaderboardFixtures.fiveFarmerLB, { status: 200 }),
  ),
  http.put("/api/game/dashboardSettings", () =>
    HttpResponse.json({}, { status: 200 }),
  ),
];

export const AdminView = makeTemplate(1);
AdminView.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    ...populatedMswHandlers({ ...baseGame, id: 1 }),
  ],
};

// A student whose game shows every section - the "everything showing" case.
export const StudentViewAllSectionsShown = makeTemplate(2);
StudentViewAllSectionsShown.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    ...populatedMswHandlers({ ...baseGame, id: 2 }),
  ],
};

// A student whose game only shows some sections - the "just some things
// showing" case. Overview and the Leaderboard are visible; the rest are
// hidden and so should be entirely absent from the page for this student.
export const StudentViewSomeSectionsShown = makeTemplate(3);
StudentViewSomeSectionsShown.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    ...populatedMswHandlers({
      ...baseGame,
      id: 3,
      showCowsPerFarmerSection: false,
      showCapacitySection: false,
      showHistogramSection: false,
      showTrendsSection: false,
      showHealthSection: false,
      showTotalCowsSection: false,
      showCapacityOverTimeSection: false,
    }),
  ],
};

// A student whose game does not show the dashboard at all.
export const StudentViewNotAuthorized = makeTemplate(4);
StudentViewNotAuthorized.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/game/plus", () => {
      return HttpResponse.json(
        {
          game: { ...baseGame, id: 4, showLeaderboard: false },
          ...baseGamePlus,
        },
        { status: 200 },
      );
    }),
  ],
};

// The dashboard while /api/game/plus is still in flight, for any user type.
export const Loading = makeTemplate(5);
Loading.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/game/plus", async () => {
      await delay("infinite");
    }),
  ],
};
