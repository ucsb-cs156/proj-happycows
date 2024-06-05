import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, useParams } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminListAnnouncementsPage from "main/pages/AdminListAnnouncementsPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { announcementFixtures } from "fixtures/announcementFixtures";

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
    useParams: jest.fn(),
}));

describe("AdminListAnnouncementsPage tests", () => {
    const axiosMock = new AxiosMockAdapter(axios);
    const testId = "AnnouncementTable";

    const setupAdminUser = () => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.adminUser);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    };

    test("Renders Create Button for admin user", async () => {
        setupAdminUser();
        const queryClient = new QueryClient();
        const commonsId = 1;

        useParams.mockReturnValue({ commonsId });

        axiosMock.onGet(`/api/announcements/all`, { params: { commonsId } }).reply(200, []);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminListAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Create Announcement/)).toBeInTheDocument();
        });
        const button = screen.getByText(/Create Announcement/);
        expect(button).toHaveAttribute("style", "float: right;");
        expect(button).toHaveAttribute("href", "/admin/announcements/1/create");
    });

    test("Announcements listed for admin user", async () => {
        setupAdminUser();
        const queryClient = new QueryClient();
        const commonsId = 1;

        useParams.mockReturnValue({ commonsId });

        axiosMock.onGet(`/api/announcements/all`, { params: { commonsId } }).reply(200, announcementFixtures.threeAnnouncements);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminListAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
        await waitFor(() => {
            expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");
        });
        expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("2");
        expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent("3");
    });
});