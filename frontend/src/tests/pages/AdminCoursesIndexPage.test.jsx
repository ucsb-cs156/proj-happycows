import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import mockConsole from "tests/testutils/mockConsole";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminCoursesIndexPage from "main/pages/AdminCoursesIndexPage";
import { coursesFixtures } from "fixtures/coursesFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { vi } from "vitest";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("AdminCoursesIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "CoursesTable";

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

  test("renders without crashing for regular user", () => {
    setupUserOnly();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/course/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCoursesIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  });

  test("renders without crashing for admin user", () => {
    setupAdminUser();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/course/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCoursesIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  });

  test("renders three commons without crashing for admin user", async () => {
    setupAdminUser();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/course/all").reply(200, coursesFixtures.threeCourses);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCoursesIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent("1");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );
    expect(screen.getByText(`Create New Course`)).toBeInTheDocument();
  });

  test("renders empty table when backend unavailable, user only", async () => {
    setupUserOnly();

    const queryClient = new QueryClient();
    axiosMock.onGet("/api/course/all").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCoursesIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });
    restoreConsole();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
    expect(screen.getByText(`Create New Course`)).toBeInTheDocument();
  });

  test("what happens when you click delete, admin", async () => {
    setupAdminUser();

    const queryClient = new QueryClient();
    axiosMock.onGet("/api/course/all").reply(200, coursesFixtures.threeCourses);
    axiosMock
      .onDelete(`/api/course/${coursesFixtures.threeCourses[0].id}`)
      .reply(200, "Course with id 1 was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCoursesIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(
        screen.getByTestId("CoursesTable-Modal-Delete"),
      ).toBeInTheDocument();
    });

    const modalDelete = screen.getByTestId("CoursesTable-Modal-Delete");
    fireEvent.click(modalDelete);

    await waitFor(() => {
      expect(mockToast).toBeCalledWith("Course with id 1 was deleted");
    });
  });

  test("what happens when you click edit as an admin", async () => {
    setupAdminUser();

    const queryClient = new QueryClient();
    axiosMock.onGet("/api/course/all").reply(200, coursesFixtures.threeCourses);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCoursesIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent("1");

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/admin/editcourses/1"),
    );
  });

  test("what happens when you click create as an admin", async () => {
    mockedNavigate.mockClear();

    setupAdminUser();

    const queryClient = new QueryClient();
    axiosMock.onGet("/api/course/all").reply(200, coursesFixtures.threeCourses);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCoursesIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent("1");

    const createButton = screen.getByText("Create New Course");

    expect(createButton).toBeInTheDocument();
    expect(createButton).toHaveAttribute("href", "/admin/createcourses");
    expect(createButton).toHaveAttribute("style", "float: right;");
  });
});
