import React from "react";
import DeveloperPage from "main/pages/DeveloperPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "pages/DeveloperPage",
  component: DeveloperPage,
};

const Template = () => <DeveloperPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(
        {
          ...systemInfoFixtures.showingAll,
          sourceRepo: "https://github.com/ucsb-cs156/proj-happycows",
        },
        {
          status: 200,
        },
      );
    }),
  ],
};
