import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminCoursesCreatePage from "main/pages/AdminCoursesCreatePage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { vi } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    __esModule: true,
    ...originalModule,
    Navigate: (x) => {
      mockedNavigate(x);
      return null;
    },
  };
});

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("AdminCreateCommonsPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCoursesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Create Course")).toBeInTheDocument();
  });

  test("When you fill in form and click submit, the right things happens", async () => {
    axiosMock.onPost("/api/course").reply(200, {
      id: 5,
      code: "CS154",
      name: "Computer Science 154",
      term: "f26",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCoursesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Create Course")).toBeInTheDocument();

    const courseCodeField = screen.getByLabelText(
      "Course Code (e.g. 'CHEM 123' or 'INT 94MW')",
    );
    const courseNameField = screen.getByLabelText("Name");
    const courseTermField = screen.getByLabelText("Term");
    const button = screen.getByTestId("CoursesForm-submit");

    fireEvent.change(courseCodeField, { target: { value: "CS154" } });
    fireEvent.change(courseNameField, {
      target: { value: "Computer Science 154" },
    });
    fireEvent.change(courseTermField, { target: { value: "f26" } });
    fireEvent.click(button);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    const expectedCourse = {
      code: "CS154",
      name: "Computer Science 154",
      term: "f26",
    };

    expect(axiosMock.history.post[0].data).toEqual(
      JSON.stringify(expectedCourse),
    );

    expect(mockToast).toBeCalledWith(
      <div>
        Course successfully created!
        <br />
        id: 5
        <br />
        code: CS154
        <br />
        name: Computer Science 154
        <br />
        term: f26
      </div>,
    );

    expect(mockedNavigate).toBeCalledWith({ to: "/admin/listcourses" });
  });
});
