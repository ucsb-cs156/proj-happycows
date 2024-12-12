import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { MemoryRouter, Routes, Route } from "react-router-dom";

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

    test("onSubmit sets endDate to null if it's blank", async () => {
        const submitActionMock = jest.fn();
    
        const initialContents = {
            startDate: "2023-11-21",
            announcementText: "Test announcement",
        };
    
        render(
            <QueryClientProvider client={queryClient}>
                <AnnouncementForm initialContents={initialContents} submitAction={submitActionMock} />
            </QueryClientProvider>
        );
    
        const startDateField = screen.getByTestId("AnnouncementForm-startDate");
        const endDateField = screen.getByTestId("AnnouncementForm-endDate");
        const messageField = screen.getByTestId("AnnouncementForm-announcementText");
        const submitButton = screen.getByTestId("AnnouncementForm-submit");
    
        fireEvent.change(startDateField, { target: { value: "2023-11-21" } });
        fireEvent.change(endDateField, { target: { value: "" } });
        fireEvent.change(messageField, { target: { value: "Test announcement" } });
    
        fireEvent.click(submitButton);
    
        await waitFor(() => {
            expect(submitActionMock).toHaveBeenCalledWith({
                startDate: "2023-11-21",
                endDate: null,  
                announcementText: "Test announcement",
            });
        });
    });
    
    test("onSubmit sends valid data when endDate is provided", async () => {
        const submitActionMock = jest.fn();
    
        const initialContents = {
            startDate: "2023-11-21",
            announcementText: "Test announcement",
        };
    
        render(
            <QueryClientProvider client={queryClient}>
                <AnnouncementForm initialContents={initialContents} submitAction={submitActionMock} />
            </QueryClientProvider>
        );
    
        const startDateField = screen.getByTestId("AnnouncementForm-startDate");
        const endDateField = screen.getByTestId("AnnouncementForm-endDate");
        const messageField = screen.getByTestId("AnnouncementForm-announcementText");
        const submitButton = screen.getByTestId("AnnouncementForm-submit");
    
        fireEvent.change(startDateField, { target: { value: "2023-11-21" } });
        fireEvent.change(endDateField, { target: { value: "2024-11-21" } });
        fireEvent.change(messageField, { target: { value: "Test announcement" } });
    
        fireEvent.click(submitButton);
    
        await waitFor(() => {
            expect(submitActionMock).toHaveBeenCalledWith({
                startDate: "2023-11-21",
                endDate: "2024-11-21", 
                announcementText: "Test announcement",
            });
        });
    });
    

    test("displays error messages for missing required fields", async () => {
        const submitActionMock = jest.fn();
    
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <AnnouncementForm submitAction={submitActionMock} />
                </Router>
            </QueryClientProvider>
        );
    
        const submitButton = screen.getByTestId("AnnouncementForm-submit");
        fireEvent.click(submitButton);
    
        await waitFor(() => {
            expect(screen.getByText("Announcement is required.")).toBeInTheDocument();
        });
    
        expect(submitActionMock).not.toHaveBeenCalled();
    });

    test("onSubmit handles missing announcementText", async () => {
        const submitActionMock = jest.fn();
    
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <AnnouncementForm
                        submitAction={submitActionMock}
                        initialContents={{
                            startDate: "2023-11-21",
                            endDate: "2024-11-21",
                        }}
                    />
                </Router>
            </QueryClientProvider>
        );
    
        const startDateField = screen.getByTestId("AnnouncementForm-startDate");
        const endDateField = screen.getByTestId("AnnouncementForm-endDate");
        const messageField = screen.getByTestId("AnnouncementForm-announcementText");
        const submitButton = screen.getByTestId("AnnouncementForm-submit");
    
        fireEvent.change(startDateField, { target: { value: "2023-11-21" } });
        fireEvent.change(endDateField, { target: { value: "2024-11-21" } });
        fireEvent.change(messageField, { target: { value: "" } });
    
        fireEvent.click(submitButton);
    
        await waitFor(() => {
            expect(screen.getByText("Announcement is required.")).toBeInTheDocument();
        });
    
        expect(submitActionMock).not.toHaveBeenCalled();
    });

    test("renders custom button label", async () => {
        const submitActionMock = jest.fn();
    
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <AnnouncementForm
                        buttonLabel="Update"
                        submitAction={submitActionMock}
                    />
                </Router>
            </QueryClientProvider>
        );
    
        const submitButton = screen.getByTestId("AnnouncementForm-submit");
        expect(submitButton).toHaveTextContent("Update");
    });

    test("prefills form correctly with initialContents", async () => {
        const initialContents = {
            id: 1,
            startDate: "2023-11-21",
            endDate: "2024-11-21",
            announcementText: "Test announcement",
        };
    
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <AnnouncementForm initialContents={initialContents} />
                </Router>
            </QueryClientProvider>
        );
    
        const idField = screen.getByTestId("AnnouncementForm-id");
        const startDateField = screen.getByTestId("AnnouncementForm-startDate");
        const endDateField = screen.getByTestId("AnnouncementForm-endDate");
        const messageField = screen.getByTestId("AnnouncementForm-announcementText");
    
        expect(idField).toHaveValue(initialContents.id.toString());
        expect(startDateField).toHaveValue(initialContents.startDate);
        expect(endDateField).toHaveValue(initialContents.endDate);
        expect(messageField).toHaveValue(initialContents.announcementText);
    });

    test('Start Date is required and shows an error message if left blank', async () => {
        const submitActionMock = jest.fn();
    
        const initialContents = {
            startDate: "2023-11-21",
            announcementText: "Test announcement",
        };
    
        render(
            <QueryClientProvider client={queryClient}>
                <AnnouncementForm initialContents={initialContents} submitAction={submitActionMock} />
            </QueryClientProvider>
        );
    
        const startDateField = screen.getByTestId("AnnouncementForm-startDate");
        const submitButton = screen.getByTestId("AnnouncementForm-submit");

        fireEvent.change(startDateField, { target: { value: "" } });
    
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Start Date is required.")).toBeInTheDocument();
        });
    });

    test('should populate startDate with the mocked current date on create announcement page', async () => {
        const submitActionMock = jest.fn();
        const mockDate = new Date(2023, 0, 5);
        global.Date = jest.fn(() => mockDate);

        const initialContents = {
            announcementText: "Test announcement",
        };

        render(
            <MemoryRouter initialEntries={['/admin/announcements/3/create']}>
                <QueryClientProvider client={queryClient}>
                    <Routes>
                        <Route path="/admin/announcements/3/create" element={
                            <AnnouncementForm initialContents={initialContents} submitAction={submitActionMock} />
                        } />
                    </Routes>
                </QueryClientProvider>
            </MemoryRouter>
        );
    
        await waitFor(() => {
            const startDateField = screen.getByTestId("AnnouncementForm-startDate");
            expect(startDateField.value).toBe("2023-01-05");
        });

        const submitButton = screen.getByTestId("AnnouncementForm-submit");
        fireEvent.click(submitButton);
    
        await waitFor(() => {
            expect(submitActionMock).toHaveBeenCalledWith({
                startDate: "2023-01-05",
                endDate: null,
                announcementText: "Test announcement",
            });
        });
    });
});