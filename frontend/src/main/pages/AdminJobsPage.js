import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import JobsTable from "main/components/Jobs/JobsTable";
import { useBackend } from "main/utils/useBackend";
import Accordion from 'react-bootstrap/Accordion';
import TestJobForm from "main/components/Jobs/TestJobForm";
import InstructorReportJobForm from "main/components/Jobs/InstructorReportJobForm";
import UpdateCowHealthJobForm from "main/components/Jobs/UpdateCowHealthJobForm";
import MilkTheCowsJobForm from "main/components/Jobs/MilkTheCowsJobForm";
import { useBackendMutation } from "main/utils/useBackend";

const AdminJobsPage = () => {

    const refreshJobsIntervalMilliseconds = 5000;

    // test job 

    const objectToAxiosParamsTestJob = (data) => ({
        url: `/api/jobs/launch/testjob?fail=${data.fail}&sleepMs=${data.sleepMs}`,
        method: "POST"
    });
    
    const objectToAxiosParamsInstructorReportJob = (_data) => ({
        url: '/api/jobs/launch/instructorreport',
        method: "POST"
    });
    const objectToAxiosParamsUpdateCowHealthJob = (_data) => ({
        url: '/api/jobs/launch/updatecowhealth',
        method: "POST"
    });
    const objectToAxiosParamsMilkTheCowsJob = (_data) => ({
        url: '/api/jobs/launch/milkthecowjob',
        method: "POST"
    });
    
    // Stryker disable all
    const testJobMutation = useBackendMutation(
        objectToAxiosParamsTestJob,
        {  },
        ["/api/jobs/all"]
    );
    const instructorReportJobMutation = useBackendMutation(
        objectToAxiosParamsInstructorReportJob,
        {  },
        ["/api/jobs/all"]
    );
    const updateCowHealthJobMutation = useBackendMutation(
        objectToAxiosParamsUpdateCowHealthJob,
        {  },
        ["/api/jobs/all"]
    );
    const milkTheCowsJobMutation = useBackendMutation(
        objectToAxiosParamsMilkTheCowsJob,
        {  },
        ["/api/jobs/all"]
    );
    // Stryker enable all

    const submitTestJob = async (data) => {
        console.log("submitTestJob, data=", data);
        testJobMutation.mutate(data);
    }

    const submitInstructorReportJob = async (data) => {
        console.log("submitInstructorReportJob, data=", data);
        instructorReportJobMutation.mutate(data);
    }
    const submitUpdateCowHealthJob = async (data) => {
        console.log("submitUpdateCowHealthJob, data=", data);
        updateCowHealthJobMutation.mutate(data);
    }
    const submitMilkTheCowsJob = async (data) => {
        console.log("submitMilkTheCowsJob, data=", data);
        milkTheCowsJobMutation.mutate(data);
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
    // Stryker enable  all 

    const jobLaunchers = [
        {
            name: "Update Cow Health",
            form: <UpdateCowHealthJobForm submitAction={submitUpdateCowHealthJob}/>
        },
        {
            name: "Milk The Cows",
            form: <MilkTheCowsJobForm submitAction ={submitMilkTheCowsJob}/>
        },
        {
            name: "Instructor Report",
            form: <InstructorReportJobForm submitAction={submitInstructorReportJob}/>
        },
        {
            name: "Test Job",
            form: <TestJobForm submitAction={submitTestJob} />
        },
    ]

    return (
        <BasicLayout>
            <h2 className="p-3">Launch Jobs</h2>
            <Accordion>
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
