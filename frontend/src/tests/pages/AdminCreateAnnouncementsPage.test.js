import { fireEvent, render, screen, waitFor } from "@testing-library/react";
// import { useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import AdminCreateAnnouncementsPage from "main/pages/AdminCreateAnnouncementsPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => {
    const originalModule = jest.requireActual("react-router-dom");
    return {
        __esModule: true,
        ...originalModule,
        Navigate: (x) => {
            mockedNavigate(x);
            return null;
        },
    };
});

const mockToast = jest.fn();
jest.mock("react-toastify", () => {
    const originalModule = jest.requireActual("react-toastify");
    return {
        __esModule: true,
        ...originalModule,
        toast: (x) => mockToast(x),
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
        axiosMock.onGet("/api/commons/plus").reply(200, {
            commons: { name: "Test Commons" },
        });
    });

    test("renders without crashing", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={["/admin/announcements/create/1"]}>
                    <AdminCreateAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByText("Create Announcement for Test Commons")).toBeInTheDocument();
    });

    test("When you fill in form and click submit, the right things happen", async () => {
        axiosMock.onPost("/api/announcements/post/42").reply((config) => {
            console.log("POST request data:", config.data); 
            return [200, {
                id: 42,
                startDate: "2023-11-21T17:52:33.000-08:00",
                endDate: "2024-11-21T17:52:33.000-08:00",
                message: "Test announcement"
            }];
        });

        jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ commonsId: "42" });
    
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={["/admin/announcements/create/42"]}>
                    <AdminCreateAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByText("Create Announcement for Test Commons")).toBeInTheDocument();

        const startDateField = screen.getByLabelText("Start Date");
        const endDateField = screen.getByLabelText("End Date");
        const messageField = screen.getByLabelText("Announcement");
        const submitButton = screen.getByTestId("AnnouncementForm-submit");

        fireEvent.change(startDateField, { target: { value: "2023-11-21" } });
        fireEvent.change(endDateField, { target: { value: "2024-11-21T" } });
        fireEvent.change(messageField, { target: { value: "Test announcement" } });
    
        fireEvent.click(submitButton);

        await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    });
    
    
});
