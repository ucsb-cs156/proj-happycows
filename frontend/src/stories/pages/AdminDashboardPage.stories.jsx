import React from "react";
import AdminDashboardPage from "main/pages/AdminDashboardPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import { http, HttpResponse } from "msw";

export default {
  title: "pages/AdminDashboardPage",
  component: AdminDashboardPage,
};

const Template = () => <AdminDashboardPage />;

export const Default = Template.bind({});

Default.parameters = {
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
    http.get("/api/commons/numcows", () => {
      return HttpResponse.json([1, 2, 3, 5, 10, 15, 20], {
        status: 200,
      });
    }),
  ],
};

export const WithData = Template.bind({});

WithData.parameters = {
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
    http.get("/api/commons/plus", () => {
      return HttpResponse.json(
        {
          commons: {
            id: 1,
            name: "Sample Commons",
          },
          totalPlayers: 7,
          totalCows: 55,
          minCows: 1,
          maxCows: 20,
          avergeCows: 7.86,
          stdDevCows: 6.23,
        },
        { status: 200 },
      );
    }),
    http.get("/api/commons/numcows", () => {
      return HttpResponse.json([1, 2, 3, 5, 10, 15, 20], {
        status: 200,
      });
    }),
  ],
};
