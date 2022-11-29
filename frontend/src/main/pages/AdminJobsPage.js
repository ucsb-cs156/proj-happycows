import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import JobsTable from "main/components/Jobs/JobsTable";
import { useBackend } from "main/utils/useBackend";
import Accordion from 'react-bootstrap/Accordion';
import TestJobForm from "main/components/Jobs/TestJobForm";
import InstructorReportJobForm from "main/components/Jobs/InstructorReportJobForm";
import UpdateCowHealthJobForm from "main/components/Jobs/UpdateCowHealthJobForm";
import MilkCowsJobForm from "main/components/Jobs/MilkCowsJobForm";

import { useBackendMutation } from "main/utils/useBackend";

const AdminJobsPage = () => {

    const refreshJobsIntervalMilliseconds = 5000;

    // Stryker disable all
    const objectToAxiosParamsMilkCowsJob = (_data) => ({
        url: `/api/jobs/launch/milkjob`,
        method: "POST"
    });

    // Stryker disable all
    const objectToAxiosParamsTestJob = (data) => ({
        url: `/api/jobs/launch/testjob?fail=${data.fail}&sleepMs=${data.sleepMs}`,
        method: "POST"
    });

    // Stryker disable all
    const objectToAxiosParamsInstructorJob = () => ({
        url: `/api/jobs/launch/instructorreportjob`,
        method: "POST"
    });

    // Stryker disable all
    const objectToAxiosParamsCowHealthJob = () => ({
        url: `/api/jobs/launch/updatecowhealthjob`,
        method: "POST"
    });

    // Stryker disable all
    const milkCowsJobMutation = useBackendMutation(
        objectToAxiosParamsMilkCowsJob,
        {  },
        ["/api/jobs/all"]
    );
    // Stryker disable all
    const submitMilkCowsJob = async (data) => {
        console.log("submitMilkCowsJob, data=", data);
        milkCowsJobMutation.mutate(data);
    }

    // Stryker disable all
    const testJobMutation = useBackendMutation(
        objectToAxiosParamsTestJob,
        {  },
        ["/api/jobs/all"]
    );

    const UpdateCowHealthJobMutation = useBackendMutation(
        objectToAxiosParamsCowHealthJob,
        {  },
        ["/api/jobs/all"]
    );

    const InstructorReportJobMutation = useBackendMutation(
        objectToAxiosParamsInstructorJob,
        {  },
        ["/api/jobs/all"]
    );

    const submitTestJob = async (data) => {
        console.log("submitTestJob, data=", data);
        testJobMutation.mutate(data);
    }
    const submitUpdateCowHealthJob = async (data) => {
        console.log("submitUpdateCowHealthJob, data=", data);
        UpdateCowHealthJobMutation.mutate(data);
    }
    const submitInstructorReportJob = async (data) => {
        console.log("submitInstructorReportJob, data=", data);
        InstructorReportJobMutation.mutate(data);
    }

    // Stryker disable all 
    const { data: jobs, error: _error, status: _status } =
        useBackend(
            ["/api/jobs/all"],
            {
                method: "GET",
                url: "/api/jobs/all",
            },
            [],
            { refetchInterval: refreshJobsIntervalMilliseconds }
        );

 const jobLaunchers = [
        {
            name: "Update Cow Health",
            form: <UpdateCowHealthJobForm submitAction={submitUpdateCowHealthJob}/>
        },
        {
            name: "Milk The Cows",
            form:<MilkCowsJobForm submitAction={submitMilkCowsJob} />
        },
        {
            name: "Instructor Report",
            form:<InstructorReportJobForm submitAction={submitInstructorReportJob} />
        },
    ]


    return (
        <BasicLayout>
            <h2 className="p-3">Launch Jobs</h2>
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Test Job</Accordion.Header>
                    <Accordion.Body>
                        <TestJobForm submitAction={submitTestJob} />
                    </Accordion.Body>
                </Accordion.Item>
                {
                    jobLaunchers.map((jobLauncher, index) => (
                        <Accordion.Item eventKey={index + 1}>
                            <Accordion.Header>{jobLauncher.name}</Accordion.Header>
                            <Accordion.Body>
                                {jobLauncher.form}
                            </Accordion.Body>
                        </Accordion.Item>
                    ))
                }
            </Accordion>

            <h2 className="p-3">Job Status</h2>

            <JobsTable jobs={jobs} />
        </BasicLayout>
    );
};

export default AdminJobsPage;
