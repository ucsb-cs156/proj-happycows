import React from "react";
import { Route, Routes } from "react-router";
import AdminEditAnnouncementsPage from "main/pages/AdminEditAnnouncementsPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { announcementFixtures } from "fixtures/announcementFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "pages/AdminEditAnnouncementsPage",
  component: AdminEditAnnouncementsPage,
};

const editAnnouncementPath = "/admin/announcements/1/edit/1";

const Template = () => (
  <Routes location={editAnnouncementPath}>
    <Route
      path="/admin/announcements/:commonsId/edit/:announcementId"
      element={<AdminEditAnnouncementsPage />}
    />
  </Routes>
);

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
    http.get("/api/commons/plus", () => {
      return HttpResponse.json(
        {
          commons: {
            id: 1,
            name: "Sample Commons",
          },
          totalPlayers: 5,
          totalCows: 5,
        },
        { status: 200 },
      );
    }),
    http.get("/api/announcements/getbyid", () => {
      return HttpResponse.json(announcementFixtures.oneAnnouncement, {
        status: 200,
      });
    }),
  ],
};
