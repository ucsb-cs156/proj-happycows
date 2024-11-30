import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "react-query";
import {MemoryRouter} from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminCreateAnnouncementsPage from "main/pages/AdminCreateAnnouncementsPage";
import {apiCurrentUserFixtures} from "fixtures/currentUserFixtures";
import {systemInfoFixtures} from "fixtures/systemInfoFixtures";
import AdminAnnouncementsPage from "main/pages/AdminAnnouncementsPage";

import { toast } from "react-toastify";
import React from "react";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({
        commonsId: 1,
    }),
    useNavigate: () => mockedNavigate
}));

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


    test("correct href for create announcements button as an admin", async () => {   
        axiosMock
            .onGet("/api/currentUser")
            .reply(200, apiCurrentUserFixtures.adminUser);
        axiosMock.onGet("/api/commons/plus", { params: { id: 1 } }).reply(200, {
            commons: {
                id: 1,
                name: "Sample Commons",
            },
            totalPlayers: 5,
            totalCows: 5,
        });

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
      
        const createButton = await screen.findByText("Create Announcement");
        expect(createButton).toHaveAttribute("href", "/admin/announcements/1/create");        

    });

    test("correct href for create announcements button as a player", async () => {
        axiosMock
            .onGet("/api/currentUser")
            .reply(200, apiCurrentUserFixtures.playerUser);
        axiosMock.onGet("/api/commons/plus", { params: { id: 1 } }).reply(200, {
            commons: {
                id: 1,
                name: "Sample Commons",
            },
            totalPlayers: 5,
            totalCows: 5,
        });

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
      
        const createButton = await screen.findByText("Create Announcement");
        expect(createButton).toHaveAttribute("href", "/admin/announcements/1/create");        

    });

    test("calls toast with correct message", () => {
        const announcement = {
            id: 42,
            startDate: "2023-11-21",
            endDate: "2024-11-21",
            announcementText: "Test announcement",
        };

        const onSuccess = (announcement) => {
            toast(
                <div>
                    <p>Announcement successfully created!</p>
                    <ul>
                        <li>{`ID: ${announcement.id}`}</li>
                        <li>{`Start Date: ${announcement.startDate}`}</li>
                        <li>{`End Date: ${announcement.endDate}`}</li>
                        <li>{`Announcement: ${announcement.announcementText}`}</li>
                    </ul>
                </div>
            );
        };

        onSuccess(announcement);

        expect(toast).toHaveBeenCalledWith(
            <div>
                <p>Announcement successfully created!</p>
                <ul>
                    <li>{`ID: 42`}</li>
                    <li>{`Start Date: 2023-11-21`}</li>
                    <li>{`End Date: 2024-11-21`}</li>
                    <li>{`Announcement: Test announcement`}</li>
                </ul>
            </div>
        );
    });

});

jest.mock("react-toastify", () => ({
    toast: jest.fn(),
}));

describe("AdminCreateAnnouncementsPage tests - test", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    test("calls toast with correct message on success", async () => {
        const announcementResponse = {
            id: 42,
            startDate: "2023-11-21",
            endDate: "2024-11-21",
            announcementText: "Test announcement",
        };

        axiosMock.onPost("/api/announcements/post/1").reply(200, announcementResponse);

        render(
            <QueryClientProvider client={new QueryClient()}>
                <MemoryRouter initialEntries={["/admin/announcements/create/1"]}>
                    <AdminCreateAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        const startDateField = screen.getByLabelText("Start Date");
        const endDateField = screen.getByLabelText("End Date");
        const messageField = screen.getByLabelText("Announcement");
        const submitButton = screen.getByTestId("AnnouncementForm-submit");

        fireEvent.change(startDateField, { target: { value: "2023-11-21" } });
        fireEvent.change(endDateField, { target: { value: "2024-11-21" } });
        fireEvent.change(messageField, { target: { value: "Test announcement" } });

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(toast).toHaveBeenCalledWith(
                <div>
                    <p>Announcement successfully created!</p>
                    <ul>
                        <li>{`ID: 42`}</li>
                        <li>{`Start Date: 2023-11-21`}</li>
                        <li>{`End Date: 2024-11-21`}</li>
                        <li>{`Announcement: Test announcement`}</li>
                    </ul>
                </div>
            );
        });
    });

});