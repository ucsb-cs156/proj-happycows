import JobsTable from "main/components/Jobs/JobsTable";
import jobsFixtures from "fixtures/jobsFixtures";

export default {
  title: "components/Jobs/JobsTable",
  component: JobsTable,
};

export const Emptytable = {
  render: () => <JobsTable jobs={[]} />,
  name: "emptytable",
};

export const SixJobs = {
  render: () => <JobsTable jobs={jobsFixtures.sixJobs} />,
  name: "six-jobs",
};
