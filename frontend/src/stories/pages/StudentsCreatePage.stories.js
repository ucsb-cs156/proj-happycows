import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { rest } from "msw";

import StudentsCreatePage from "main/pages/StudentsCreatePage";

export default {
  title: "pages/StudentsCreatePage",
  component: StudentsCreatePage,
};

const Template = () => <StudentsCreatePage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    rest.get("/api/currentUser", (_req, res, ctx) => {
      return res(ctx.json(apiCurrentUserFixtures.userOnly));
    }),
    rest.get("/api/systemInfo", (_req, res, ctx) => {
      return res(ctx.json(systemInfoFixtures.showingNeither));
    }),
    rest.post("/api/Students/post", (_req, res, ctx) => {
      return res(ctx.json({}));
    }),
  ],
};
