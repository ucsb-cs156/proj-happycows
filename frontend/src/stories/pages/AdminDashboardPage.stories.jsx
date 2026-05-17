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
  ],
};