import React from "react";
import AdminListCommonsPageV2 from "main/pages/AdminListCommonPageV2";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";
import commonsPlusFixtures from "fixtures/commonsPlusFixtures";

export default {
  title: "pages/AdminListCommonsPageV2",
  component: AdminListCommonsPageV2,
};

export const adminListPage = () => <AdminListCommonsPageV2 />;

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
    http.get("/api/commons/allplus", () => {
      return HttpResponse.json(commonsPlusFixtures.threeCommonsPlus, {
        status: 200,
      });
    }),
  ],
};

export const adminListPageEmpty = () => <AdminListCommonsPageV2 />;

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
    http.get("/api/commons/allplus", () => {
      return HttpResponse.json([], {
        status: 200,
      });
    }),
  ],
};
