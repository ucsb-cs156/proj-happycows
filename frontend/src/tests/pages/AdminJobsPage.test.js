
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import AdminJobsPage from "main/pages/AdminJobsPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import jobsFixtures from "fixtures/jobsFixtures";

describe("AdminJobsPage tests", () => {
    const queryClient = new QueryClient();
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.adminUser);
        axiosMock.onGet("/api/jobs/all").reply(200, jobsFixtures.sixJobs);
    });

    test("renders without crashing", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminJobsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
        expect(await screen.findByText("Launch Jobs")).toBeInTheDocument();
        expect(await screen.findByText("Job Status")).toBeInTheDocument();


        expect(await screen.findByText("Test Job")).toBeInTheDocument();
        expect(await screen.findByText("Update Cow Health")).toBeInTheDocument();
        expect(await screen.findByText("Milk The Cows")).toBeInTheDocument();
        expect(await screen.findByText("Instructor Report")).toBeInTheDocument();

        const testId = "JobsTable";

        expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-Created`)).toHaveTextContent("1");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-Updated`)).toHaveTextContent("11/13/2022, 19:49:59");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-status`)).toHaveTextContent("complete");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-Log`)).toHaveTextContent("Hello World! from test job!Goodbye from test job!");

    });

    test("user can submit a test job", async () => {

        axiosMock.onPost("/api/jobs/launch/testjob?fail=false&sleepMs=0")
            .reply(200, jobsFixtures.sixJobs[0]);
    
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminJobsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByText("Test Job")).toBeInTheDocument();
        const testJobButton = screen.getByText("Test Job");
        expect(testJobButton).toBeInTheDocument();
        testJobButton.click();

        expect(await screen.findByTestId("TestJobForm-fail")).toBeInTheDocument();

        const sleepMsInput = screen.getByTestId("TestJobForm-sleepMs");
        const submitButton = screen.getByTestId("TestJobForm-Submit-Button");

        expect(sleepMsInput).toBeInTheDocument();
        expect(submitButton).toBeInTheDocument();

        fireEvent.change(sleepMsInput, { target: { value: '0' } })
        submitButton.click();

        await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

        expect(axiosMock.history.post[0].url).toBe("/api/jobs/launch/testjob?fail=false&sleepMs=0");

        expect(await screen.findByText("Update Cow Health")).toBeInTheDocument();
        const chb = screen.getByText("Update Cow Health");
        expect(chb).toBeInTheDocument();
        chb.click();
        const submitButton2 = screen.getByTestId("UpdateCowHealthJobForm-Submit-Button");
        submitButton2.click();
        await waitFor(() => expect(axiosMock.history.post.length).toBe(2));
        expect(axiosMock.history.post[1].url).toBe("/api/jobs/launch/updatecowhealthjob");

        expect(await screen.findByText("Instructor Report")).toBeInTheDocument();
        const irb = screen.getByText("Instructor Report");
        expect(irb).toBeInTheDocument();
        irb.click();
        const submitButton4 = screen.getByTestId("InstructorReportJobForm-Submit-Button");
        submitButton4.click();
        await waitFor(() => expect(axiosMock.history.post.length).toBe(3));
        expect(axiosMock.history.post[2].url).toBe("/api/jobs/launch/instructorreportjob");

        expect(await screen.findByText("Milk The Cows")).toBeInTheDocument();
        const mcb = screen.getByText("Milk The Cows");
        expect(mcb).toBeInTheDocument();
        mcb.click();
        const submitButton3 = screen.getByTestId("MilkCowsForm-Submit-Button");
        submitButton3.click();
        await waitFor(() => expect(axiosMock.history.post.length).toBe(4));
        expect(axiosMock.history.post[3].url).toBe("/api/jobs/launch/milkjob");


    });

    test("user can submit a milk the cows job", async () => {

        axiosMock.onPost("/api/jobs/launch/milkcows").reply(200, jobsFixtures.sixJobs[0]);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminJobsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByText("Milk The Cows")).toBeInTheDocument();

        const jobButton = screen.getByText("Milk The Cows");
        expect(jobButton).toBeInTheDocument();
        jobButton.click();

        const submitButton = screen.getByTestId("MilkCowsForm-Submit-Button");
        expect(submitButton).toBeInTheDocument();
        submitButton.click();

        await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

        expect(axiosMock.history.post[0].url).toBe("/api/jobs/launch/milkjob");
    });


});
