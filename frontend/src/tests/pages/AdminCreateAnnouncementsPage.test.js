import { render, screen } from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "react-query";
import {MemoryRouter} from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminCreateAnnouncementsPage from "main/pages/AdminCreateAnnouncementsPage";
import {apiCurrentUserFixtures} from "fixtures/currentUserFixtures";
import {systemInfoFixtures} from "fixtures/systemInfoFixtures";
import AdminAnnouncementsPage from "main/pages/AdminAnnouncementsPage";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"), 
    useParams: () => ({
        commonsId: 1,
    }),
    useNavigate: () => mockedNavigate
}));

describe("AdminCreateAnnouncementsPage tests", () => {
    const axiosMock = new AxiosMockAdapter(axios);
    const queryClient = new QueryClient();

    beforeEach(() => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.adminUser);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
        axiosMock.onGet("/api/commons/plus", { params: { id: 1 } }).reply(200, {commons: { id: 1, name: "Sample Commons", }, totalPlayers: 5, totalCows: 5,});
    });

    test("renders page without crashing", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminCreateAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByText("Create Announcement for Sample Commons")).toBeInTheDocument();

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


});