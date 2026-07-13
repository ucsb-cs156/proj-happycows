import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import StudentsForm from "main/components/Students/StudentsForm";
import { studentsFixtures } from "fixtures/studentsFixtures";
import { coursesFixtures } from "fixtures/coursesFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { vi } from "vitest";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("StudentsForm tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Last Name",
    "First/Middle Name",
    "Email",
    "Perm Number",
    "Course",
  ];
  const testId = "StudentsForm";

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.onGet("/api/course/all").reply(200, coursesFixtures.threeCourses);
  });

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <StudentsForm />
        </Router>
      </QueryClientProvider>,
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
          <StudentsForm initialContents={studentsFixtures.oneStudent[0]} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <StudentsForm />
        </Router>
      </QueryClientProvider>,
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
          <StudentsForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Last name is required./);
    expect(
      screen.getByText(/First\/Middle name is required./),
    ).toBeInTheDocument();
    expect(screen.getByText(/Email is required./)).toBeInTheDocument();
    expect(screen.getByText(/Perm number is required./)).toBeInTheDocument();
  });

  test("shows a course validation error when no course is selected", async () => {
    // don't let the course list resolve, so the dropdown has no options
    // selected and submitting immediately triggers the "required" validator.
    // A fresh QueryClient is used so this test isn't served cached course
    // data from an earlier test in this file.
    axiosMock.reset();
    axiosMock.onGet("/api/course/all").timeout();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <StudentsForm />
        </Router>
      </QueryClientProvider>,
    );

    const submitButton = await screen.findByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText("Course is required.");
  });
});
