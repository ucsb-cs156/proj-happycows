import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import PagedAnnouncementTable from "main/components/Commons/PagedAnnouncementTable";
import pagedAnnouncementFixtures from "fixtures/pagedAnnouncementFixtures";
import { useBackend } from "main/utils/useBackend";

jest.mock("main/utils/useBackend");

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}));

describe("PagedAnnouncementTable tests", () => {

    const queryClient = new QueryClient();
    // const testId = "PagedAnnouncementTable";

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
                content: pagedAnnouncementFixtures.smallTable,
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

        const expectedAnnouncement = pagedAnnouncementFixtures.smallTable[1].announcementText;
        const announcementElement = await screen.findByText(expectedAnnouncement);
        expect(announcementElement).toBeInTheDocument();

        const expectedHeaders = ["Start Date", "End Date", "Important Announcements"];
        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });
    });

    // test("renders empty table correctly", () => {
    //     // arrange
    //     useBackend.mockReturnValue({
    //         data: {
    //             content: [],
    //             totalPages: 0
    //         },
    //         error: null,
    //         status: "success"
    //     });

    //     // act
    //     render(
    //         <QueryClientProvider client={queryClient}>
    //             <MemoryRouter>
    //                 <PagedAnnouncementTable />
    //             </MemoryRouter>
    //         </QueryClientProvider>
    //     );

    //     // assert
    //     const expectedHeaders = ["Start Date", "End Date", "Important Announcements"];
    //     expectedHeaders.forEach((headerText) => {
    //         const header = screen.getByText(headerText);
    //         expect(header).toBeInTheDocument();
    //     });

    //     // expect(screen.getByRole("table")).toBeInTheDocument();
    // });

    // test("filters future announcements correctly", () => {
    //     // arrange
    //     const pastAnnouncement = {
    //         id: 1,
    //         commonsId: 1,
    //         startDate: "2022-12-12T00:00:00",
    //         endDate: null,
    //         announcementText: "Past announcement"
    //     };

    //     const futureAnnouncement = {
    //         id: 2,
    //         commonsId: 1,
    //         startDate: "2024-12-12T00:00:00",
    //         endDate: null,
    //         announcementText: "Future announcement"
    //     };

    //     useBackend.mockReturnValue({
    //         data: {
    //             content: [pastAnnouncement, futureAnnouncement],
    //             totalPages: 1
    //         },
    //         error: null,
    //         status: "success"
    //     });

    //     // act
    //     render(
    //         <QueryClientProvider client={queryClient}>
    //             <MemoryRouter>
    //                 <PagedAnnouncementTable />
    //             </MemoryRouter>
    //         </QueryClientProvider>
    //     );

    //     // assert
    //     expect(screen.getByText("Past announcement")).toBeInTheDocument();
    //     expect(screen.queryByText("Future announcement")).not.toBeInTheDocument();
    // });

    // test("handles null end dates correctly", () => {
    //     // arrange
    //     const announcementWithNullEnd = {
    //         id: 1,
    //         commonsId: 1,
    //         startDate: "2022-12-12T00:00:00",
    //         endDate: null,
    //         announcementText: "Test announcement"
    //     };

    //     useBackend.mockReturnValue({
    //         data: {
    //             content: [announcementWithNullEnd],
    //             totalPages: 1
    //         },
    //         error: null,
    //         status: "success"
    //     });

    //     // act
    //     render(
    //         <QueryClientProvider client={queryClient}>
    //             <MemoryRouter>
    //                 <PagedAnnouncementTable />
    //             </MemoryRouter>
    //         </QueryClientProvider>
    //     );

    //     // assert
    //     const rows = screen.getAllByRole("row");
    //     expect(rows[1].cells[1].textContent).toBe("");
    // });

    // test("sorts announcements by start date in descending order", () => {
    //     // arrange
    //     const announcements = [
    //         {
    //             id: 1,
    //             commonsId: 1,
    //             startDate: "2022-01-01T00:00:00",
    //             endDate: null,
    //             announcementText: "Older announcement"
    //         },
    //         {
    //             id: 2,
    //             commonsId: 1,
    //             startDate: "2022-12-31T00:00:00",
    //             endDate: null,
    //             announcementText: "Newer announcement"
    //         }
    //     ];

    //     useBackend.mockReturnValue({
    //         data: {
    //             content: announcements,
    //             totalPages: 1
    //         },
    //         error: null,
    //         status: "success"
    //     });

    //     // act
    //     render(
    //         <QueryClientProvider client={queryClient}>
    //             <MemoryRouter>
    //                 <PagedAnnouncementTable />
    //             </MemoryRouter>
    //         </QueryClientProvider>
    //     );

    //     // assert
    //     const rows = screen.getAllByRole("row");
    //     expect(rows[1].textContent).toContain("Newer announcement");
    //     expect(rows[2].textContent).toContain("Older announcement");
    // });
});