import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "react-query";
import {MemoryRouter} from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminCreateAnnouncementsPage from "main/pages/AdminCreateAnnouncementsPage";
import {apiCurrentUserFixtures} from "fixtures/currentUserFixtures";
import {systemInfoFixtures} from "fixtures/systemInfoFixtures";
import AdminAnnouncementsPage from "main/pages/AdminAnnouncementsPage";
import { useParams } from 'react-router-dom';

import { toast } from "react-toastify";
import React from "react";


jest.mock("react-toastify", () => ({
    toast: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({
        commonsId: "1",
    }),
}));

describe("AdminCreateAnnouncementsPage tests", () => {
    const axiosMock = new AxiosMockAdapter(axios);
    const queryClient = new QueryClient();

    beforeEach(() => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, {
            root: { user: { email: "admin@example.com" } },
            loggedIn: true,
          });
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
    test("When you fill in form and click submit, the right things happens", async () => {
        jest.spyOn(require("react-router-dom"), "useParams").mockReturnValue({ commonsId: "13" });

        axiosMock.onPost("/api/announcements/post/13").reply(200, {
            "id": 13,
            "startDate": "2024-11-28",
            "endDate": "2024-11-29",
            "announcementText": "Test announcement",
        });

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={["/admin/announcements/create/13"]}>
                    <AdminCreateAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByText("Create Announcement for Test")).toBeInTheDocument();

        const startDateField = screen.getByLabelText("Start Date");
        const endDateField = screen.getByLabelText("End Date");
        const messageField = screen.getByLabelText("Announcement");
        const submitButton = screen.getByTestId("AnnouncementForm-submit");

        fireEvent.change(startDateField, { target: { value: "2024-11-28" } });
        fireEvent.change(endDateField, { target: { value: "2024-11-29" } });
        fireEvent.change(messageField, { target: { value: "Test announcement" } });

        fireEvent.click(submitButton);

        await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

        // The Date object is initialized from the form without time information. I believe React
        // Query calls toISOString() before stuffing it into the body of the POST request, so the
        // POST contains the suffix .000Z, which Java's LocalDateTime.parse ignores. [1]

        const expectedAnnouncement = {
            startDate: "2024-11-28",
            endDate: "2024-11-29",
            announcementText: "Test announcement",
        };

        expect(axiosMock.history.post[0].data).toEqual( JSON.stringify(expectedAnnouncement) );

        expect(mockToast).toBeCalledWith(<div>Announcement successfully created!
            <br />id: 13
            <br />startDate: 2024-11-28
            <br />endDate: 2024-11-29
            <br />announcementText: Test Announcement
        </div>);

        expect(mockedNavigate).toBeCalledWith({"to": "/"});
    });
    
});