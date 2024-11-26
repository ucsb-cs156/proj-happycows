import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import PagedAnnouncementTable from "main/components/Commons/PagedAnnouncementTable";
import { announcementFixtures } from "fixtures/announcementFixtures";
import { useBackend } from "main/utils/useBackend";

jest.mock("main/utils/useBackend");

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}));

describe("PagedAnnouncementTable tests", () => {

    const queryClient = new QueryClient();

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-01-15T12:00:00'));
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    test("renders table with announcements correctly", async () => {
        // arrange
        const mockUseParams = jest.spyOn(require('react-router-dom'), 'useParams');
        mockUseParams.mockReturnValue({ commonsId: 1 });

        useBackend.mockReturnValue({
            data: {
                content: announcementFixtures.threeAnnouncements,
                totalPages: 0
            },
            error: null,
            status: "success"
        });

        // act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PagedAnnouncementTable/>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // assert
        await waitFor(() => {
            expect(useBackend).toHaveBeenCalledWith(
                ["/api/announcements/getbycommonsid"],
                {
                    method: "GET",
                    url: "/api/announcements/getbycommonsid",
                    params: {
                        commonsId: 1
                    }
                },
                { content: [], totalPages: 0 },
                { refetchInterval: 5000 }
            );
        });

        const expectedAnnouncement = announcementFixtures.threeAnnouncements[1].announcementText;
        const announcementElement = await screen.findByText(expectedAnnouncement);
        expect(announcementElement).toBeInTheDocument();

        const expectedHeaders = ["Start Date", "End Date", "Important Announcements"];
        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });
    });

    test("renders empty table correctly", () => {
        // arrange
        const mockUseParams = jest.spyOn(require('react-router-dom'), 'useParams');
        mockUseParams.mockReturnValue({ commonsId: 1 });

        useBackend.mockReturnValue({
            data: {
                content: [],
                totalPages: 0
            },
            error: null,
            status: "success"
        });

        // act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PagedAnnouncementTable />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // assert
        const expectedHeaders = ["Start Date", "End Date", "Important Announcements"];
        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

    });

    test("filters future announcements correctly", () => {
        // arrange
        const mockUseParams = jest.spyOn(require('react-router-dom'), 'useParams');
        mockUseParams.mockReturnValue({ commonsId: 1 });

        const pastAnnouncement = {
            id: 1,
            commonsId: 1,
            startDate: "2022-12-12T00:00:00",
            endDate: null,
            announcementText: "Past announcement"
        };

        const futureAnnouncement = {
            id: 2,
            commonsId: 1,
            startDate: "2024-12-12T00:00:00",
            endDate: null,
            announcementText: "Future announcement"
        };

        useBackend.mockReturnValue({
            data: {
                content: [pastAnnouncement, futureAnnouncement],
                totalPages: 1
            },
            error: null,
            status: "success"
        });

        // act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PagedAnnouncementTable />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // assert
        expect(screen.getByText("Past announcement")).toBeInTheDocument();
        expect(screen.queryByText("Future announcement")).not.toBeInTheDocument();
    });

    test("handles null end dates correctly", () => {
        // arrange
        const mockUseParams = jest.spyOn(require('react-router-dom'), 'useParams');
        mockUseParams.mockReturnValue({ commonsId: 1 });

        const announcementWithNullEnd = {
            id: 1,
            commonsId: 1,
            startDate: "2022-12-12T00:00:00",
            endDate: null,
            announcementText: "Test announcement"
        };

        useBackend.mockReturnValue({
            data: {
                content: [announcementWithNullEnd],
                totalPages: 1
            },
            error: null,
            status: "success"
        });

        // act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PagedAnnouncementTable />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // assert
        const rows = screen.getAllByRole("row");
        expect(rows[1].cells[1].textContent).toBe("");
    });

    test("sorts announcements by start date in descending order", () => {
        // arrange
        const mockUseParams = jest.spyOn(require('react-router-dom'), 'useParams');
        mockUseParams.mockReturnValue({ commonsId: 1 });

        const announcements = [
            {
                id: 1,
                commonsId: 1,
                startDate: "2022-01-01T00:00:00",
                endDate: null,
                announcementText: "Older announcement"
            },
            {
                id: 2,
                commonsId: 1,
                startDate: "2023-01-15T12:00:00",
                endDate: null,
                announcementText: "Current announcement"
            },
            {
                id: 3,
                commonsId: 1,
                startDate: "2022-12-31T00:00:00",
                endDate: "2026-12-31T00:00:00",
                announcementText: "Newer announcement"
            }
        ];

        useBackend.mockReturnValue({
            data: {
                content: announcements,
                totalPages: 1
            },
            error: null,
            status: "success"
        });

        // act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PagedAnnouncementTable />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // assert
        const rows = screen.getAllByRole("row");
        expect(rows[1].textContent).toContain("Current announcement");
        expect(rows[2].textContent).toContain("Newer announcement");
        expect(rows[3].textContent).toContain("Older announcement");
    });

    test("for current date equal to start date or end date", async () => {
        const mockUseParams = jest.spyOn(require('react-router-dom'), 'useParams');
        mockUseParams.mockReturnValue({ commonsId: 1 });

        const testAnnouncements = [
            {
                id: 1,
                startDate: "2023-01-15T12:00:00",
                endDate: "2023-02-01T00:00:00",
                announcementText: "Exact start date"
            },
            {
                id: 2,
                startDate: "2023-01-01T00:00:00",
                endDate: "2023-01-15T12:00:00",
                announcementText: "Exact end date"
            },
            {
                id: 3,
                startDate: "2023-01-15T12:00:01",
                endDate: "2023-02-01T00:00:00",
                announcementText: "Future start date"
            },
            {
                id: 4,
                startDate: "2022-01-15T12:00:01",
                endDate: "2023-01-01T00:00:00",
                announcementText: "Past end date"
            }
        ];

        useBackend.mockReturnValue({
            data: {
                content: testAnnouncements,
                totalPages: 1
            },
            error: null,
            status: "success"
        });

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PagedAnnouncementTable/>
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(screen.getByText("Exact start date")).toBeInTheDocument();
        expect(screen.getByText("Exact end date")).toBeInTheDocument();
        expect(screen.queryByText("Future start date")).not.toBeInTheDocument();
        expect(screen.queryByText("Past end date")).not.toBeInTheDocument();
    });

    test("for endDate accessor", async () => {
        const mockUseParams = jest.spyOn(require('react-router-dom'), 'useParams');
        mockUseParams.mockReturnValue({ commonsId: 1 });
    
        const testAnnouncements = [
            {
                id: 1,
                startDate: "2023-01-01T00:00:00",
                endDate: "2023-01-31T00:00:00",
                announcementText: "Test announcement 1"
            },
            {
                id: 2,
                startDate: "2023-01-02T00:00:00",
                endDate: null,
                announcementText: "Test announcement 2"
            }
        ];
    
        useBackend.mockReturnValue({
            data: {
                content: testAnnouncements,
                totalPages: 1
            },
            error: null,
            status: "success"
        });
    
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PagedAnnouncementTable/>
                </MemoryRouter>
            </QueryClientProvider>
        );
    
        await waitFor(() => {
            expect(screen.getByText("End Date")).toBeInTheDocument();
        });
    
        const cells = screen.getAllByRole('cell');
    
        const firstRowData = cells.slice(0, 3);
        const secondRowData = cells.slice(3, 6);

        expect(firstRowData[0]).toHaveTextContent("2023-01-02");
        expect(firstRowData[1]).toHaveTextContent("");
        expect(firstRowData[2]).toHaveTextContent("Test announcement 2");

        expect(secondRowData[0]).toHaveTextContent("2023-01-01");
        expect(secondRowData[1]).toHaveTextContent("2023-01-31");
        expect(secondRowData[2]).toHaveTextContent("Test announcement 1");
    });
});