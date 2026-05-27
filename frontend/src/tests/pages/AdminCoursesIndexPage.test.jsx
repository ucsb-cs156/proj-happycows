import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CoursesIndexPage from "main/pages/AdminCoursesIndexPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import mockConsole from "tests/testutils/mockConsole";
import { coursesFixtures } from "fixtures/coursesFixtures";
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

describe("CoursesIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "CoursesTable";

  const getQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // do not retry on failure
        },
      },
    });

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  test("Renders with Create Button for admin user", async () => {
    setupAdminUser();
    axiosMock.onGet("/api/course/all").reply(200, []);

    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <CoursesIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Create Course/)).toBeInTheDocument();
    });
    const button = screen.getByText(/Create Course/);
    expect(button).toHaveAttribute("href", "/admin/createcourses");
    expect(button.style.float).toBe("right");
  });

  test("renders three courses correctly for regular user", async () => {
    setupUserOnly();
    axiosMock.onGet("/api/course/all").reply(200, coursesFixtures.threeCourses);

    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <CoursesIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );

    const createCourseButton = screen.queryByText("Create Course");
    expect(createCourseButton).not.toBeInTheDocument();

    expect(screen.getByText("MATH 4A")).toBeInTheDocument();
    expect(screen.getByText("Linear Algebra")).toBeInTheDocument();
    expect(screen.getByText("S26")).toBeInTheDocument();

    // Non-admin: details button visible, edit/delete not visible
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend unavailable, user only", async () => {
    setupUserOnly();
    axiosMock.onGet("/api/course/all").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <CoursesIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Table headers should still exist
    await waitFor(() => {
      expect(screen.getByTestId(`${testId}-header-id`)).toBeInTheDocument();
    });

    // No course rows should exist
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();

    restoreConsole();
  });

  test("what happens when you click delete, admin", async () => {
    setupAdminUser();

    axiosMock.onGet("/api/course/all").reply(200, coursesFixtures.threeCourses);
    axiosMock.onDelete("/api/course/1").reply(200, {
      message: "Course deleted!",
    });

    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <CoursesIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toBeCalledWith("Course deleted!");
    });

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
      expect(axiosMock.history.delete[0].url).toBe("/api/course/1");
    });
  });
});
