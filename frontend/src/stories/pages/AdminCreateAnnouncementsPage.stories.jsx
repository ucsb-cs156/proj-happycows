import React from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import AdminCreateAnnouncementsPage from "main/pages/AdminCreateAnnouncementsPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "pages/AdminCreateAnnouncementsPage",
  component: AdminCreateAnnouncementsPage,
};

const Template = () => (
  <MemoryRouter initialEntries={["/admin/announcements/1/create"]}>
    <Routes>
      <Route
        path="/admin/announcements/:commonsId/create"
        element={<AdminCreateAnnouncementsPage />}
      />
    </Routes>
  </MemoryRouter>
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
  ],
};
