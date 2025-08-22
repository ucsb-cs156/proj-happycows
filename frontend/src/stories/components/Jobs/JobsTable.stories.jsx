import React from "react";

import JobsTable from "main/components/Jobs/JobsTable";
import jobsFixtures from "fixtures/jobsFixtures";

export default {
  title: "components/Jobs/JobsTable",
  component: JobsTable,
};

const Template = (args) => {
  return <JobsTable {...args} />;
};

export const Emptytable = Template.bind({});

Emptytable.args = {
  jobs: [],
};

export const SixJobs = Template.bind({});

SixJobs.args = {
  jobs: jobsFixtures.sixJobs,
};
