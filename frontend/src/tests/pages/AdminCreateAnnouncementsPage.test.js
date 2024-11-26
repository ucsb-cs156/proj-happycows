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

    test("ensures correct API call is made with all parameters", async () => {
        jest.spyOn(require("react-router-dom"), "useParams").mockReturnValue({ commonsId: "42" });

        const newAnnouncement = {
            announcementText: "Test announcement",
            startDate: "2023-11-21",
            endDate: "2024-11-21",
        };

        axiosMock.onPost("/api/announcements/post/42").reply((config) => {
            const requestData = JSON.parse(config.data);
            expect(requestData.announcementText).toBe(newAnnouncement.announcementText);
            expect(requestData.startDate).toBe(newAnnouncement.startDate);
            expect(requestData.endDate).toBe(newAnnouncement.endDate);
            return [
                200,
                {
                    id: 42,
                    ...newAnnouncement,
                },
            ];
        });

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

        fireEvent.change(startDateField, { target: { value: newAnnouncement.startDate } });
        fireEvent.change(endDateField, { target: { value: newAnnouncement.endDate } });
        fireEvent.change(messageField, { target: { value: newAnnouncement.announcementText } });

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(axiosMock.history.post.length).toBe(1);
        });
    });

    test("ensures success toast displays correct data", async () => {
        jest.spyOn(require("react-router-dom"), "useParams").mockReturnValue({ commonsId: "42" });

        const announcementResponse = {
            id: 42,
            startDate: "2023-11-21",
            endDate: "2024-11-21",
            announcementText: "Test announcement",
        };

        axiosMock.onPost("/api/announcements/post/42").reply(200, announcementResponse);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={["/admin/announcements/create/42"]}>
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
            expect(mockToast).toHaveBeenCalledWith(
                <div>
                    <p>Announcement successfully created!</p>
                    <ul>
                        <li>{`ID: ${announcementResponse.id}`}</li>
                        <li>{`Start Date: ${announcementResponse.startDate}`}</li>
                        <li>{`End Date: ${announcementResponse.endDate}`}</li>
                        <li>{`Announcement: ${announcementResponse.announcementText}`}</li>
                    </ul>
                </div>
            );
        });
    });

    test("ensures navigation occurs on success", async () => {
        jest.spyOn(require("react-router-dom"), "useParams").mockReturnValue({ commonsId: "42" });

        axiosMock.onPost("/api/announcements/post/42").reply(200, {});

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={["/admin/announcements/create/42"]}>
                    <AdminCreateAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        const announcementField = screen.getByLabelText("Announcement");
        const submitButton = screen.getByTestId("AnnouncementForm-submit");

        fireEvent.change(announcementField, { target: { value: "Test announcement" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith({"to": "/"});
        });
    });

    test("ensures API call fails if params is empty", async () => {
        jest.spyOn(require("react-router-dom"), "useParams").mockReturnValue({ commonsId: "42" });
    
        const newAnnouncement = {
            announcementText: "Test announcement",
            startDate: "2023-11-21",
            endDate: "2024-11-21",
        };
    
        axiosMock.onPost("/api/announcements/post/42").reply((config) => {
            const requestData = config.params;
            if (!requestData.announcementText && !requestData.startDate && !requestData.endDate) {
                return [400, { message: "Required request parameters are missing" }];
            }
            return [200, { id: 42, ...newAnnouncement }];
        });
    
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={["/admin/announcements/create/42"]}>
                    <AdminCreateAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
    
        const startDateField = screen.getByLabelText("Start Date");
        const endDateField = screen.getByLabelText("End Date");
        const messageField = screen.getByLabelText("Announcement");
        const submitButton = screen.getByTestId("AnnouncementForm-submit");
    
        fireEvent.change(startDateField, { target: { value: newAnnouncement.startDate } });
        fireEvent.change(endDateField, { target: { value: newAnnouncement.endDate } });
        fireEvent.change(messageField, { target: { value: newAnnouncement.announcementText } });
    
        fireEvent.click(submitButton);
    
        await waitFor(() => {
            expect(axiosMock.history.post.length).toBe(1);
        });

        const lastRequest = axiosMock.history.post[0];
        const sentParams = lastRequest.params;
    
        expect(sentParams).toEqual({"announcementText": "Test announcement", "endDate": "2024-11-21","startDate": "2023-11-21",});

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith(
            <div>
                <p>Announcement successfully created!</p>
                <ul>
                    <li>ID: 42</li>
                    <li>Start Date: 2023-11-21</li>
                    <li>End Date: 2024-11-21</li>
                    <li>Announcement: Test announcement</li>
                </ul>
            </div>
            );
        });
    });
    
});
