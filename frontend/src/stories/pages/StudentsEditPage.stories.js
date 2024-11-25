import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { studentsFixtures } from "fixtures/studentsFixtures";
import { rest } from "msw";

import StudentsEditPage from "main/pages/StudentsEditPage";

export default {
  title: "pages/StudentsEditPage",
  component: StudentsEditPage,
};

const Template = () => <StudentsEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    rest.get("/api/currentUser", (_req, res, ctx) => {
      return res(ctx.json(apiCurrentUserFixtures.userOnly));
    }),
    rest.get("/api/systemInfo", (_req, res, ctx) => {
      return res(ctx.json(systemInfoFixtures.showingNeither));
    }),
    rest.get("/api/Students", (_req, res, ctx) => {
      return res(ctx.json(studentsFixtures.threeStudents[0]));
    }),
    rest.put("/api/Students", (_req, res, ctx) => {
      return res(ctx.json({}));
    }),
  ],
};
