import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import AdminCoursesEditPage from "main/pages/AdminCoursesEditPage";
import { coursesFixtures } from "fixtures/coursesFixtures";

export default {
  title: "pages/AdminCoursesEditPage",
  component: AdminCoursesEditPage,
};

const Template = () => <AdminCoursesEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
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
    http.get("/api/course/:id", () => {
      return HttpResponse.json(coursesFixtures.threeCourses[0], {
        status: 200,
      });
    }),
    http.put("/api/course/:id", () => {
      return HttpResponse.json(coursesFixtures.oneCourse[0], {
        status: 200,
      });
    }),
  ],
};
