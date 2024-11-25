import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import AdminAnnouncementsPage from "main/pages/AdminAnnouncementsPage";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({
        commonsId: 1,
    }),
    useNavigate: () => mockedNavigate,
}));

describe("AdminAnnouncementsPage tests", () => {
    const axiosMock = new AxiosMockAdapter(axios);
    const queryClient = new QueryClient();

    beforeEach(() => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.adminUser);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    });

    test("renders page without crashing", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
    });

    test("renders announcements with correct commons name", async () => {
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

        expect(await screen.findByText("Announcements for Commons: Sample Commons")).toBeInTheDocument();
    });

    test("ensures correct create announcement button", async () => {
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

        const button = await screen.findByRole("button", { name: /Create Announcement/i });
        expect(button).toHaveAttribute("href", "/admin/announcements/1/create");
    });
});
