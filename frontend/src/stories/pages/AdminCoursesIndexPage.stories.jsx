import React from "react";
import AdminCoursesIndexPage from "main/pages/AdminCoursesIndexPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";
import coursesFixtures from "fixtures/coursesFixtures";

export default {
  title: "pages/AdminCoursesIndexPage",
  component: AdminCoursesIndexPage,
};

export const adminThreeCoursesIndexPage = () => <AdminCoursesIndexPage />;

adminThreeCoursesIndexPage.parameters = {
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
    http.get("/api/course/all", () => {
      return HttpResponse.json(coursesFixtures.threeCourses, {
        status: 200,
      });
    }),
  ],
};
