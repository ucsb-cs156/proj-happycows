import React from "react";
import { http, HttpResponse } from "msw";

import AdminJobLogPage from "main/pages/AdminJobLogPage";
import jobsFixtures from "fixtures/jobsFixtures";

export default {
  title: "pages/AdminJobLogPage",
  component: AdminJobLogPage,
};

const Template = () => <AdminJobLogPage />;

export const Default = Template.bind({});

Default.parameters = {
  msw: [
    http.get("/api/jobs/logs/:id", () => {
      return HttpResponse.text(jobsFixtures.sixJobs[0].log, { status: 200 });
    }),
  ],
};
