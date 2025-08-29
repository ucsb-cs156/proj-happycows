import React from "react";
import { http, HttpResponse } from "msw";

import PagedJobsTable from "main/components/Jobs/PagedJobsTable";
import jobsFixtures from "fixtures/jobsFixtures";

export default {
  title: "components/Jobs/PagedJobsTable",
  component: PagedJobsTable,
};

const Template = (args) => {
  return <PagedJobsTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  nextPageCallback: () => {},
  previousPageCallback: () => {},
};

export const SixJobs = Template.bind({});

SixJobs.args = {
  nextPageCallback: () => {},
  previousPageCallback: () => {},
};

SixJobs.parameters = {
  msw: [
    http.get("/api/jobs/all/pageable", () => {
      return HttpResponse.json(
        {
          content: jobsFixtures.sixJobs,
          totalPages: 1,
        },
        { status: 200 },
      );
    }),
  ],
};
