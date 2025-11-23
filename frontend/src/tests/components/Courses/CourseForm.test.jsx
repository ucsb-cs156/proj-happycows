import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import CourseForm from "main/components/Courses/CourseForm";
import { courseFixtures } from "fixtures/courseFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi } from "vitest";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("CourseForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["Code", "Name", "Term"];
  const testId = "CourseForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <CourseForm />
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
          <CourseForm initialContents={courseFixtures.oneCourse} />
        </Router>
      </QueryClientProvider>,
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
          <CourseForm />
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
          <CourseForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByTestId(`${testId}-submit`);
    fireEvent.click(submitButton);

    await screen.findByText(/Code is required/);
    expect(screen.getByText(/Name is required/)).toBeInTheDocument();
    expect(screen.getByText(/Term is required/)).toBeInTheDocument();
  });

  test("shows max length validation error", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <CourseForm />
        </Router>
      </QueryClientProvider>,
    );

    const codeInput = screen.getByTestId(`${testId}-code`);
    const nameInput = await screen.findByTestId(`${testId}-name`);
    const termInput = await screen.findByTestId(`${testId}-term`);
    const submitButton = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(codeInput, { target: { value: "a".repeat(31) } });
    fireEvent.change(nameInput, { target: { value: "a".repeat(101) } });
    fireEvent.change(termInput, { target: { value: "a".repeat(11) } });

    fireEvent.click(submitButton);

    await screen.findByText(/Code max length 30 characters/);
    expect(
      screen.getByText(/Name max length 100 characters/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Term max length 10 characters/),
    ).toBeInTheDocument();
  });
});
