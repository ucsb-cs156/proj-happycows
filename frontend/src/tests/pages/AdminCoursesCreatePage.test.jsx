import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CoursesCreatePage from "main/pages/AdminCoursesCreatePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("CoursesCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CoursesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Code")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /course", async () => {
    const queryClient = new QueryClient();
    const course = {
      id: 3,
      code: "MATH 4A",
      name: "Linear Algebra",
      term: "S26",
    };

    axiosMock.onPost("/api/course").reply(200, course);
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CoursesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Code")).toBeInTheDocument();
    });

    const codeInput = screen.getByLabelText("Code");
    expect(codeInput).toBeInTheDocument();

    const nameInput = screen.getByLabelText("Name");
    expect(nameInput).toBeInTheDocument();

    const termInput = screen.getByLabelText("Term");
    expect(termInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(codeInput, { target: { value: "MATH 4A" } });
    fireEvent.change(nameInput, { target: { value: "Linear Algebra" } });
    fireEvent.change(termInput, {
      target: { value: "S26" },
    });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      code: "MATH 4A",
      name: "Linear Algebra",
      term: "S26",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New Course Created - id: 3 code: MATH 4A",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/admin/listcourses" });
  });
});
