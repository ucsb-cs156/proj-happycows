import React from "react";
import DashboardPage from "main/pages/DashboardPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import timeSeriesFixtures from "fixtures/timeSeriesFixtures";

import { http, HttpResponse } from "msw";

export default {
  title: "pages/DashboardPage",
  component: DashboardPage,
};

const Template = () => <DashboardPage />;

export const AdminView = Template.bind({});

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
    http.get("/api/game/plus", () => {
      return HttpResponse.json(
        {
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
        },
        { status: 200 },
      );
    }),
    http.get("/api/game/numcows", () => {
      return HttpResponse.json([1, 2, 3, 5, 10, 15, 20], {
        status: 200,
      });
    }),
    http.get("/api/game/timeseries", () => {
      return HttpResponse.json(timeSeriesFixtures.timeSeriesBigExample, {
        status: 200,
      });
    }),
    http.get("/api/farmer/game/all", () => {
      return HttpResponse.json([], { status: 200 });
    }),
    http.put("/api/game/dashboardSettings", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};

export const StudentView = Template.bind({});

StudentView.parameters = {
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
          game: {
            id: 1,
            name: "Sample Game",
            showLeaderboard: true,
            showOverviewSection: true,
            showCowsPerFarmerSection: true,
            showHistogramSection: false,
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
        },
        { status: 200 },
      );
    }),
    http.get("/api/game/numcows", () => {
      return HttpResponse.json([1, 2, 3, 5, 10, 15, 20], {
        status: 200,
      });
    }),
    http.get("/api/game/timeseries", () => {
      return HttpResponse.json(timeSeriesFixtures.timeSeriesBigExample, {
        status: 200,
      });
    }),
    http.get("/api/farmer/game/all", () => {
      return HttpResponse.json([], { status: 200 });
    }),
  ],
};

export const StudentViewNotAuthorized = Template.bind({});

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
          game: {
            id: 1,
            name: "Sample Game",
            showLeaderboard: false,
          },
          totalUsers: 7,
          totalCows: 55,
        },
        { status: 200 },
      );
    }),
  ],
};
