import React from "react";
import AdminListCommonsV2 from "main/pages/AdminListCommonsV2";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";
import commonsPlusFixtures from "fixtures/commonsPlusFixtures";

export default {
  title: "pages/AdminListCommonsV2",
  component: AdminListCommonsV2,
};

export const adminListPageV2 = () => <AdminListCommonsV2 />;

adminListPageV2.parameters = {
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
