import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import PagedJobsTable from "main/components/Jobs/PagedJobsTable";
import Accordion from "react-bootstrap/Accordion";
import TestJobForm from "main/components/Jobs/TestJobForm";
import UpdateCowHealthForm from "main/components/Jobs/UpdateCowHealthForm";
import MilkCowsJobForm from "main/components/Jobs/MilkCowsJobForm";
import InstructorReportForm from "main/components/Jobs/InstructorReportForm";
import RecordCommonStatsForm from "main/components/Jobs/RecordCommonStatsForm";
import InstructorReportSpecificGameForm from "main/components/Jobs/InstructorReportSpecificGameForm";
import { toast } from "react-toastify";

import { useBackendMutation } from "main/utils/useBackend";
import SetCowHealthForm from "main/components/Jobs/SetCowHealthForm";

const AdminJobsPage = () => {
  // *** Test job ***

  const objectToAxiosParamsTestJob = (data) => ({
    url: `/api/jobs/launch/testjob?fail=${data.fail}&sleepMs=${data.sleepMs}`,
    method: "POST",
  });

  // Stryker disable all
  const testJobMutation = useBackendMutation(objectToAxiosParamsTestJob, {}, [
    "/api/jobs/all",
  ]);
  // Stryker restore all

  const submitTestJob = async (data) => {
    toast("Submitted job: Test Job");
    testJobMutation.mutate(data);
  };

  // *** SetCowHealth job ***

  const objectToAxiosParamsSetCowHealthJob = (data) => ({
    url: `/api/jobs/launch/setcowhealth?gameID=${data.selectedGame}&health=${data.healthValue}`,
    method: "POST",
  });

  // Stryker disable all
  const SetCowHealthMutation = useBackendMutation(
    objectToAxiosParamsSetCowHealthJob,
    {},
    ["/api/jobs/all"],
  );
  // Stryker restore all

  const submitSetCowHealthJob = async (data) => {
    toast(
      `Submitted Job: Set Cow Health (Game: ${data.selectedGameName}, Health: ${data.healthValue})`,
    );
    SetCowHealthMutation.mutate(data);
  };

  // *** UpdateCowHealth job ***

  const objectToAxiosParamsUpdateCowHealthJob = () => ({
    url: `/api/jobs/launch/updatecowhealth`,
    method: "POST",
  });

  const objectToAxiosParamsUpdateCowHealthJobSingle = (data) => ({
    url: `/api/jobs/launch/updatecowhealthsinglegame?gameId=${data.selectedGame}`,
    method: "POST",
  });

  // Stryker disable all
  const UpdateCowHealthMutation = useBackendMutation(
    objectToAxiosParamsUpdateCowHealthJob,
    {},
    ["/api/jobs/all"],
  );

  const UpdateCowHealthSingleMutation = useBackendMutation(
    objectToAxiosParamsUpdateCowHealthJobSingle,
    {},
    ["/api/jobs/all"],
  );
  // Stryker restore all

  const submitUpdateCowHealthJob = async (data) => {
    if (data.selectedGameName === "All Games") {
      toast("Submitted Job: Update Cow Health");
      UpdateCowHealthMutation.mutate();
    } else {
      toast(
        `Submitted Job: Update Cow Health (Game: ${data.selectedGameName})`,
      );
      UpdateCowHealthSingleMutation.mutate(data);
    }
  };
  // *** RecordCommonStats job ***
  const objectToAxiosParamsRecordCommonStatsJob = () => ({
    url: "/api/jobs/launch/recordcommonstats",
    method: "POST",
  });

  // Stryker disable all
  const RecordCommonStatsMutation = useBackendMutation(
    objectToAxiosParamsRecordCommonStatsJob,
    {},
    ["/api/jobs/all"],
  );
  // Stryker restore all

  const submitRecordCommonStatsJob = async () => {
    toast("Submitted Job: Record Common Stats");
    RecordCommonStatsMutation.mutate();
  };

  // *** MilkTheCows job ***

  const objectToAxiosParamsMilkTheCowsJob = () => ({
    url: `/api/jobs/launch/milkthecowjob`,
    method: "POST",
  });

  const objectToAxiosParamsMilkTheCowsJobSingle = (data) => ({
    url: `/api/jobs/launch/milkthecowjobsinglegame?gameId=${data.selectedGame}`,
    method: "POST",
  });

  // Stryker disable all
  const MilkTheCowsMutation = useBackendMutation(
    objectToAxiosParamsMilkTheCowsJob,
    {},
    ["/api/jobs/all"],
  );

  const MilkTheCowsSingleMutation = useBackendMutation(
    objectToAxiosParamsMilkTheCowsJobSingle,
    {},
    ["/api/jobs/all"],
  );
  // Stryker restore all

  const submitMilkTheCowsJob = async (data) => {
    if (data.selectedGameName === "All Games") {
      toast("Submitted Job: Milk The Cows!");
      MilkTheCowsMutation.mutate();
    } else {
      toast(`Submitted Job: Milk The Cows! (Game: ${data.selectedGameName})`);
      MilkTheCowsSingleMutation.mutate(data);
    }
  };
  // *** Instructor Report job ***

  const objectToAxiosParamsInstructorReportJob = () => ({
    url: `/api/jobs/launch/instructorreport`,
    method: "POST",
  });

  // Stryker disable all
  const InstructorReportMutation = useBackendMutation(
    objectToAxiosParamsInstructorReportJob,
    {},
    ["/api/jobs/all"],
  );
  // Stryker restore all

  const submitInstructorReportJob = async () => {
    toast("Submitted Job: Instructor Report");
    InstructorReportMutation.mutate();
  };

  // *** Instructor Report (Specific Game) job ***

  const objectToAxiosParamsInstructorReportSpecificGameJob = (data) => {
    return {
      url: `/api/jobs/launch/instructorreportsinglegame?gameId=${data.selectedGame}`,
      method: "POST",
    };
  };

  // Stryker disable all
  const InstructorReportSpecificGameMutation = useBackendMutation(
    objectToAxiosParamsInstructorReportSpecificGameJob,
    {},
    ["/api/jobs/all"],
  );
  // Stryker restore all

  const submitInstructorReportSpecificGameJob = async (data) => {
    toast("Submitted Job: Instructor Report (Specific Game)");
    InstructorReportSpecificGameMutation.mutate(data);
  };

  const jobLaunchers = [
    {
      name: "Test Job",
      form: <TestJobForm submitAction={submitTestJob} />,
    },
    {
      name: "Set Cow Health for a Specific Game",
      form: <SetCowHealthForm submitAction={submitSetCowHealthJob} />,
    },
    {
      name: "Update Cow Health",
      form: <UpdateCowHealthForm submitAction={submitUpdateCowHealthJob} />,
    },
    {
      name: "Record Common Stats",
      form: <RecordCommonStatsForm submitAction={submitRecordCommonStatsJob} />,
    },
    {
      name: "Milk The Cows",
      form: <MilkCowsJobForm submitAction={submitMilkTheCowsJob} />,
    },
    {
      name: "Instructor Report",
      form: <InstructorReportForm submitAction={submitInstructorReportJob} />,
    },
    {
      name: "Instructor Report (for specific game)",
      form: (
        <InstructorReportSpecificGameForm
          submitAction={submitInstructorReportSpecificGameJob}
        />
      ),
    },
  ];

  return (
    <BasicLayout>
      <h2 className="p-3">Launch Jobs</h2>
      <Accordion>
        {jobLaunchers.map((jobLauncher, index) => (
          <Accordion.Item eventKey={index} key={index}>
            <Accordion.Header>{jobLauncher.name}</Accordion.Header>
            <Accordion.Body>{jobLauncher.form}</Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      <h2 className="p-3">Job Status</h2>
      <PagedJobsTable />
    </BasicLayout>
  );
};

export default AdminJobsPage;
