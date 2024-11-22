import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
        
    // Mocking the POST response
    axiosMock.onPost("/api/announcements/post").reply(200, {
        id: 42,
        startDate: "2023-11-21T17:52:33.000",
        endDate: "2024-11-21T17:52:33.000",
        message: "Test announcement",
    });

    render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/admin/announcements/create/1"]}>
                <AdminCreateAnnouncementsPage />
            </MemoryRouter>
        </QueryClientProvider>
    );

    expect(await screen.findByText("Create Announcement for Test Commons")).toBeInTheDocument();

    // Locate form fields and submit button
    const startDateField = screen.getByLabelText("Start Date");
    const endDateField = screen.getByLabelText("End Date");
    const messageField = screen.getByLabelText("Announcement");
    const submitButton = screen.getByTestId("AnnouncementForm-submit");

    // Simulate filling out the form with proper ISO format for the dates
    fireEvent.change(startDateField, { target: { value: "2023-11-21T17:52:33" } });
    fireEvent.change(endDateField, { target: { value: "2024-11-21T17:52:33" } });
    fireEvent.change(messageField, { target: { value: "Test announcement" } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for the API call to be triggered
    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    // Verify sent to backend
    const expectedAnnouncement = {
        startDate: "2023-11-21T17:52:33.000",
        endDate: "2024-11-21T17:52:33.000",
        announcementText: "Test announcement",
    };

    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual(expectedAnnouncement);

    // Verify the toast notification
    expect(mockToast).toBeCalledWith(
        <div>
            <p>Announcement successfully created!</p>
            <ul>
                <li>ID: 42</li>
                <li>Start Date: 2023-11-21T17:52:33.000</li>
                <li>End Date: 2024-11-21T17:52:33.000</li>
                <li>Announcement: Test announcement</li>
            </ul>
        </div>
    );

    // Verify navigation
    expect(mockedNavigate).toBeCalledWith({ to: "/" });
});

    
    
});
