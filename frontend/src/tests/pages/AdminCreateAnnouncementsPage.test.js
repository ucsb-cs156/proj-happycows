import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "react-query";
import {MemoryRouter} from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminCreateAnnouncementsPage from "main/pages/AdminCreateAnnouncementsPage";
import {apiCurrentUserFixtures} from "fixtures/currentUserFixtures";
import {systemInfoFixtures} from "fixtures/systemInfoFixtures";
import AdminAnnouncementsPage from "main/pages/AdminAnnouncementsPage";
import { BrowserRouter as Router } from "react-router-dom";


import { navigate } from "react-router-dom";
import { toast } from "react-toastify";


import React from "react";
import * as useBackendModule from 'main/utils/useBackend'; // Import the module to mock functions


const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const originalModule = jest.requireActual('react-router-dom');
    return {
        __esModule: true,
        ...originalModule,
        Navigate: (x) => { mockedNavigate(x); return null; }
    };
});

jest.mock("react-toastify", () => ({
    toast: jest.fn(),
}));


describe("AdminCreateAnnouncementsPage tests", () => {
    const axiosMock = new AxiosMockAdapter(axios);
    const queryClient = new QueryClient();

    beforeEach(() => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
        axiosMock.onGet("/api/commons/plus").reply(200, {
            commons: { name: "Test" },
        });
    });

    test("renders without crashing", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminCreateAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByText("Create Announcement for Test")).toBeInTheDocument();
    });

    test("When you fill in form and click submit, the right things happens", async () => {
        jest.spyOn(require("react-router-dom"), "useParams").mockReturnValue({ commonsId: "13" });
        // console.log("Begin test");
        axiosMock.onPost("/api/announcements/post/13").reply(200, {
            "id": 13,
            "startDate": "2024-11-28T00:00",
            "endDate": "2024-11-29T00:00",
            "announcementText": "Test",
        });
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminCreateAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByText("Create Announcement for Test")).toBeInTheDocument();

        const startDateField = screen.getByLabelText("Start Date");
        const endDateField = screen.getByLabelText("End Date");
        const messageField = screen.getByLabelText("Announcement");
        const submitButton = screen.getByTestId("AnnouncementForm-submit");

        fireEvent.change(startDateField, { target: { value: "2024-11-28T00:00" } });
        fireEvent.change(endDateField, { target: { value: "2024-11-29T00:00" } });
        fireEvent.change(messageField, { target: { value: "Test" } });

        // Verify field values
        expect(startDateField.value).toBe("2024-11-28T00:00");
        expect(endDateField.value).toBe("2024-11-29T00:00");
        expect(messageField.value).toBe("Test");

        fireEvent.click(submitButton);

        // Use waitFor to wait for the axios mock to capture the request
        await waitFor(() => {
            // console.log("Waiting for POST request...");
            expect(axiosMock.history.post.length).toBe(1);
        });

        const expectedAnnouncement = {
            startDate: "2024-11-28T00:00",
            endDate: "2024-11-29T00:00",
            announcementText: "Test",
        };

        expect(axiosMock.history.post[0].params).toEqual(expectedAnnouncement);

        await waitFor(() => {
            expect(toast).toHaveBeenCalledWith(
                <div>
                    <p>Announcement successfully created!</p>
                    <ul>
                        <li>{`ID: ${13}`}</li>
                        <li>{`Start Date: ${expectedAnnouncement.startDate}`}</li>
                        <li>{`End Date: ${expectedAnnouncement.endDate}`}</li>
                        <li>{`Announcement: ${expectedAnnouncement.announcementText}`}</li>
                    </ul>
                </div>
            );
        });

        // expect(mockedNavigate).toBeCalledWith({"to": "/"});

    });

    test("When you fill in form and click submit, the navigation happens", async () => {
        jest.spyOn(require("react-router-dom"), "useParams").mockReturnValue({ commonsId: "13" });
        // console.log("Begin test");
        // Mock useBackendMutation
        axiosMock.onPost("/api/announcements/post/13").reply(200, {
            "id": 13,
            "startDate": "2024-11-28T00:00",
            "endDate": "2024-11-29T00:00",
            "announcementText": "Test",
        });
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminCreateAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByText("Create Announcement for Test")).toBeInTheDocument();

        const startDateField = screen.getByLabelText("Start Date");
        const endDateField = screen.getByLabelText("End Date");
        const messageField = screen.getByLabelText("Announcement");
        const submitButton = screen.getByTestId("AnnouncementForm-submit");

        fireEvent.change(startDateField, { target: { value: "2024-11-28T00:00" } });
        fireEvent.change(endDateField, { target: { value: "2024-11-29T00:00" } });
        fireEvent.change(messageField, { target: { value: "Test" } });

        fireEvent.click(submitButton);

        // Assert navigation happens
        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalled();
        });
    });

    // UNCOMMENT THE TEST BELOW AND FIX THE CODE
    // ERROR IN THIS TEST!! -  Should cover last frontend mutations

/*
    test("When you fill in form and click submit, the navigation happens", async () => {
        // Mock dependencies
        jest.spyOn(require("react-router-dom"), "useParams").mockReturnValue({ commonsId: "13" });

        const mockMutation = {
            mutate: jest.fn((data, { onSuccess }) => onSuccess()),
            isSuccess: true,
            isLoading: false,
            isError: false,
        };

        jest.mock("main/utils/useBackend", () => ({
            useBackendMutation: () => mockMutation,
        }));

        // Render component
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={["/admin/announcements/create/13"]}>
                    <AdminCreateAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Simulate user interaction
        const announcementField = screen.getByLabelText("Announcement");
        const submitButton = screen.getByTestId("AnnouncementForm-submit");

        fireEvent.change(announcementField, { target: { value: "Test announcement" } });
        fireEvent.click(submitButton);

        // Wait for navigation to be triggered
        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith({ to: "/" });
        });
    });
*/

});