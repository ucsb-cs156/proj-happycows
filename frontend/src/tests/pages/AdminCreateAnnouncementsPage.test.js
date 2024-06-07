import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "react-query";
import {MemoryRouter} from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import {apiCurrentUserFixtures} from "fixtures/currentUserFixtures";
import {systemInfoFixtures} from "fixtures/systemInfoFixtures";
import healthUpdateStrategyListFixtures from "../../fixtures/healthUpdateStrategyListFixtures";
import AdminCreateAnnouncementsPage from "main/pages/AdminCreateAnnouncementsPage";

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const originalModule = jest.requireActual('react-router-dom');
    return {
        __esModule: true,
        ...originalModule,
        useParams: () => ({ 
            commonsId: "1"
        }),
        Navigate: (x) => { mockNavigate(x); return null; },
    };
});

const mockToast = jest.fn();
jest.mock('react-toastify', () => {
    const originalModule = jest.requireActual('react-toastify');
    return {
        __esModule: true,
        ...originalModule,
        toast: (x) => mockToast(x)
    };
});

describe("AdminCreateAnnouncementsPage tests", () => {
    const axiosMock = new AxiosMockAdapter(axios);
    const queryClient = new QueryClient();

    beforeEach(() => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
        axiosMock.onGet("/api/commons/all-health-update-strategies")
            .reply(200, healthUpdateStrategyListFixtures.simple);
        axiosMock.onGet("/api/commons", { params: { id: 1 } }).reply(200, {
            id: 1,
            name: "Sample Commons",
        });
        axiosMock.onGet("/api/commons/all").reply(200, [
            {
                id: 1,
                name: "Sample Commons",
            },
        ]);

        axiosMock.onGet("/api/commons/plus", { params: { id: 1 } }).reply(200, {
            commons: {
                id: 1,
                name: "Sample Commons",
            },
            totalPlayers: 5,
            totalCows: 5,
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

        expect(await screen.findByTestId("AnnouncementForm-startDate")).toBeInTheDocument();
    });

    test("when you fill in the form and hit submit, it makes a request to the backend", async () => {

        const queryClient = new QueryClient();
        const announcement = {
            id: 1,
            commonsId: 1,
            startDate: "2024-05-28T00:00",
            endDate: "2024-06-28T00:00",
            announcementText: "test"
        };

        axiosMock.onPost("/api/announcements/post").reply(200, announcement);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminCreateAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("AnnouncementForm-startDate")).toBeInTheDocument();
        });

        const startDateField = screen.getByTestId("AnnouncementForm-startDate");
        const endDateField = screen.getByTestId("AnnouncementForm-endDate");
        const announcementTextField = screen.getByTestId("AnnouncementForm-announcementText");
        const submitButton = screen.getByTestId("AnnouncementForm-submit");

        fireEvent.change(startDateField, { target: { value: '2024-05-28T00:00' } });
        fireEvent.change(endDateField, { target: { value: '2024-06-28T00:00' } });
        fireEvent.change(announcementTextField, { target: { value: 'test' } });

        expect(submitButton).toBeInTheDocument();

        fireEvent.click(submitButton);

        await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

        expect(axiosMock.history.post[0].params).toEqual(
            {
                "commonsId": "1",
                "startDate": "2024-05-28T00:00",
                "endDate": "2024-06-28T00:00",
                "announcementText": "test"
        });

        expect(mockToast).toBeCalledWith("New Announcement Created - commonsId: 1 id: 1 startDate: 2024-05-28T00:00 endDate: 2024-06-28T00:00 announcmentText: test");
        expect(mockNavigate).toBeCalledWith({ "to": "/admin/announcements/1" });
    });

});