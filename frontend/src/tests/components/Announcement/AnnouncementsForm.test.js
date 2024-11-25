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
    });

    test("that start date is set to current date when not provided, and end date is null", async () => {
        const submitActionMock = jest.fn();
    
        const mockAnnouncement = {
            announcementText: "Test announcement",
            startDate: "",
            endDate: "" 
        };
    
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <AnnouncementForm 
                        submitAction={submitActionMock} 
                        initialContents={mockAnnouncement} 
                    />
                </Router>
            </QueryClientProvider>
        );
    
        expect(await screen.findByText(/Create/)).toBeInTheDocument();
    
        const submitButton = screen.getByText(/Create/);
        fireEvent.click(submitButton);
    
        await waitFor(() => {
            expect(submitActionMock).toHaveBeenCalledTimes(1);
        });
    
        const submittedData = submitActionMock.mock.calls[0][0];
    
        await waitFor(() => {
            const currentDate = new Date().getTime();
            const startDate = new Date(submittedData.startDate).getTime();
            expect(Math.abs(startDate - currentDate)).toBeLessThan(100000);
        });
    
        await waitFor(() => {
            expect(submittedData.endDate).toBeNull();
        });
    });

    test("that navigate(-1) is called", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <AnnouncementForm />
                </Router>
            </QueryClientProvider>
        );

        const cancelButton = await screen.findByTestId(`${testId}-cancel`);
        expect(cancelButton).toBeInTheDocument();

        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith(-1);
        });
    });

});
