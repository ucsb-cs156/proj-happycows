import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "react-query";
import {MemoryRouter} from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import {apiCurrentUserFixtures} from "fixtures/currentUserFixtures";
import {systemInfoFixtures} from "fixtures/systemInfoFixtures";
import AdminEditAnnouncementsPage from "main/pages/AdminEditAnnouncementsPage";

const mockToast = jest.fn();
jest.mock('react-toastify', () => {
    const originalModule = jest.requireActual('react-toastify');
    return {
        __esModule: true,
        ...originalModule,
        toast: (x) => mockToast(x)
    };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const originalModule = jest.requireActual('react-router-dom');
    return {
        __esModule: true,
        ...originalModule,
        useParams: () => ({
            announcementId: 1
        }),
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});

describe("AdminEditAnnouncementsPage tests", () => {
    describe("tests where backend is working normally", () => {
        
        const axiosMock = new AxiosMockAdapter(axios);

        beforeEach(() => {
            axiosMock.reset();
            axiosMock.resetHistory();
            axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
            axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
            axiosMock.onGet("/api/announcements/getbyid", { params: { id: 1 } }).reply(200, {
                "id": 1,
                "commonsId": 1,
                "startDate": "2024-05-28T00:00",
                "endDate": "2024-06-28T00:00",
                "announcementText": "test",
            });
            axiosMock.onPut('/api/announcements/put').reply(200, {
                "id": 1,
                "commonsId": 1,
                "startDate": "2024-05-29T00:00",
                "endDate": "2023-06-29T00:00",
                "announcementText": "new test",
            });
        });

        const queryClient = new QueryClient();

        test("renders without crashing", () => {
            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <AdminEditAnnouncementsPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );
        });

        test("Is populated with the data provided", async () => {
            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <AdminEditAnnouncementsPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("AnnouncementForm-startDate");

            const startDateField = screen.getByLabelText(/Start Date/);
            const endDateField = screen.getByLabelText(/End Date/);
            const announcementTextField = screen.getByLabelText(/Announcement/);

            expect(startDateField).toHaveValue("2024-05-28T00:00");
            expect(endDateField).toHaveValue("2024-06-28T00:00");
            expect(announcementTextField).toHaveValue("test");

        });

        test("Changes when you click Update", async () => {
            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <AdminEditAnnouncementsPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            expect(await screen.findByLabelText(/Start Date/)).toBeInTheDocument();

            const startDateField = screen.getByLabelText(/Start Date/);
            const endDateField = screen.getByLabelText(/End Date/);
            const announcementTextField = screen.getByLabelText(/Announcement/);

            expect(startDateField).toHaveValue("2024-05-28T00:00");
            expect(endDateField).toHaveValue("2024-06-28T00:00");
            expect(announcementTextField).toHaveValue("test");

            const submitButton = screen.getByText("Update");

            expect(submitButton).toBeInTheDocument();

            fireEvent.change(startDateField, { target: { value: "2024-05-29T00:00" } })
            fireEvent.change(endDateField, { target: { value: "2024-06-29T00:00" } })
            fireEvent.change(announcementTextField, { target: { value: "new test" } })

            fireEvent.click(submitButton);

            await waitFor(() => expect(mockToast).toHaveBeenCalled());
            expect(mockToast).toBeCalledWith("Announcement Updated - id: 1 announcementText: new test");
            expect(mockNavigate).toBeCalledWith({ "to": "/admin/announcements/1" });

            expect(axiosMock.history.put.length).toBe(1); 
            expect(axiosMock.history.put[0].params).toEqual(
                { 
                    id: 1, 
                    commonsId: 1, 
                    startDate: "2024-05-29T00:00", 
                    endDate: "2024-06-29T00:00", 
                    announcementText: "new test" 
                });
        });
    });
});