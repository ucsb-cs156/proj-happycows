import React from "react";
import AdminListGamePageV2 from "main/pages/AdminListGamePageV2";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";
import gamePlusFixtures from "fixtures/gamePlusFixtures";

export default {
  title: "pages/AdminListGamePageV2",
  component: AdminListGamePageV2,
};

export const adminListPage = () => <AdminListGamePageV2 />;

adminListPage.parameters = {
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
    http.get("/api/game/allplus", () => {
      return HttpResponse.json(gamePlusFixtures.threeGamePlus, {
        status: 200,
      });
    }),
  ],
};

export const adminListPageEmpty = () => <AdminListGamePageV2 />;

adminListPageEmpty.parameters = {
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
    http.get("/api/game/allplus", () => {
      return HttpResponse.json([], {
        status: 200,
      });
    }),
  ],
};
