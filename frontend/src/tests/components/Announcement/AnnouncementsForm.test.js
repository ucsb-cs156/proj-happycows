import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import AnnouncementForm from "main/components/Announcement/AnnouncementForm";
import { announcementFixtures } from "fixtures/announcementFixtures"

import { QueryClient, QueryClientProvider } from "react-query";

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate
}));

describe("AnnouncementForm tests", () => {
    const queryClient = new QueryClient();

    const expectedHeaders = ["Start Date", "End Date", "Announcement"];
    const testId = "AnnouncementForm";

    test("renders correctly with no initialContents", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <AnnouncementForm />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

    });

    test("renders correctly when passing in initialContents", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <AnnouncementForm initialContents={announcementFixtures.oneAnnouncement} />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

        expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
        expect(screen.getByText(`Id`)).toBeInTheDocument();
    });


    test("that navigate(-1) is called when Cancel is clicked", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <AnnouncementForm />
                </Router>
            </QueryClientProvider>
        );
        expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
        const cancelButton = screen.getByTestId(`${testId}-cancel`);

        fireEvent.click(cancelButton);

        await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
    });

    test("that the correct validations are performed", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <AnnouncementForm />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();
        const submitButton = screen.getByText(/Create/);
        fireEvent.click(submitButton);

        await screen.findByText(/Start Date is required and must be provided in ISO format./);
        expect(screen.getByText(/Announcement is required./)).toBeInTheDocument();

    });

    // test("current date is set as the default value for startDate", async () => {
    //     const mock_submit = jest.fn();
    //     const current_date = new Date(2024, 10, 29);
    //     global.Date = jest.fn(() => current_date);

    //     const initialContents = {
    //         announcementText: "This is a test announcement",
    //     };

    //     render(
    //         <QueryClientProvider client={queryClient}>
    //             <Router>
    //                 <AnnouncementForm initialContents={initialContents} submitAction={mock_submit} />
    //             </Router>
    //         </QueryClientProvider>
    //     );

    //     await waitFor(() => {
    //         const startDateField = screen.getByTestId("AnnouncementForm-startDate");
    //         expect(startDateField.value).toBe("2024-11-29");
    //     });

    //     const submitButton = screen.getByTestId("AnnouncementForm-submit");
    //     fireEvent.click(submitButton);

    //     await waitFor(() => {
    //         expect(submitActionMock).toHaveBeenCalledWith({
    //             startDate: "2024-11-29",
    //             endDate: null,
    //             announcementText: "This is a test announcement",
    //         });
    //     });   
    // });

});