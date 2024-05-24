import { render, screen, waitFor } from "@testing-library/react";
import mockConsole from "jest-mock-console";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import AdminListAnnouncementsPage from "main/pages/AdminListAnnouncementsPage";
//import { useCurrentUser } from "main/utils/currentUser";


//jest.mock('main/utils/currentUser');

const mockToast = jest.fn();
jest.mock('react-toastify', () => {
    const originalModule = jest.requireActual('react-toastify');
    return {
        __esModule: true,
        ...originalModule,
        toast: (x) => mockToast(x)
    };
});

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate
}));

describe("AdminListAnnouncementsPage tests", () => {
    const axiosMock = new AxiosMockAdapter(axios);
    const queryClient = new QueryClient();

    const mockAnnouncements = [
        { id: 1, title: 'Announcement 1', date: '2024-05-20' },
        { id: 2, title: 'Announcement 2', date: '2024-05-21' }
    ];

    const mockCurrentUser = {
        loggedIn: true,
        root: {
            user: {
                id: 1,
                email: "a@a.com",
                admin: true,
                commons: [
                    { id: 1, name: "1" },
                    { id: 3, name: "3" }
                ]
            }
        }
    };

    const setupUserOnly = () => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    };

    const setupAdminUser = () => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.adminUser);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    };

    test("renders correctly for admin users", async () => {
        setupAdminUser();
        axiosMock.onGet("/api/announcements/all", { params: { commonsId: 1 } }).reply(200, mockAnnouncements);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/admin/announcements/1']}>
                    <Routes>
                        <Route path="/admin/announcements/:commonsId" element={<AdminListAnnouncementsPage />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(screen.getByText('Announcements for Commons 1')).toBeInTheDocument();
        expect(screen.getByText('Create Announcement')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Announcement 1')).toBeInTheDocument();
            expect(screen.getByText('Announcement 2')).toBeInTheDocument();
        });
    });

    test("redirects non-admin users", async () => {
        setupUserOnly();
        axiosMock.onGet("/api/announcements/all", { params: { commonsId: 1 } }).reply(200, []);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/admin/announcements/1']}>
                    <Routes>
                        <Route path="/admin/announcements/:commonsId" element={<AdminListAnnouncementsPage />} />
                        <Route path="/not-found" element={<div>Not Found Page</div>} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Not Found Page')).toBeInTheDocument();
        });
    });

    test("renders empty table when backend unavailable, user only", async () => {
        setupUserOnly();
        axiosMock.onGet("/api/announcements/all", { params: { commonsId: 1 } }).timeout();

        const restoreConsole = mockConsole();

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/admin/announcements/1']}>
                    <Routes>
                        <Route path="/admin/announcements/:commonsId" element={<AdminListAnnouncementsPage />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => { expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1); });
        restoreConsole();

        expect(screen.queryByText('Announcement 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Announcement 2')).not.toBeInTheDocument();
    });
});