import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminCoursesCreatePage from "main/pages/AdminCoursesCreatePage";
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

describe("AdminCoursesCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockToast.mockClear();
    mockedNavigate.mockClear();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const getQueryClient = () => new QueryClient();

  test("Renders expected content", async () => {
    setupUserOnly();

    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <AdminCoursesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Create Course")).toBeInTheDocument();
  });

  test("submits a new course and redirects", async () => {
    setupUserOnly();
    axiosMock.onPost("/api/course").reply(200, {
      id: 12,
      code: "CMPSC 156",
      name: "Advanced Applications Programming",
      term: "F25",
    });

    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <AdminCoursesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Create Course")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Course Code"), {
      target: { value: "CMPSC 156" },
    });
    fireEvent.change(screen.getByLabelText("Course Name"), {
      target: { value: "Advanced Applications Programming" },
    });
    fireEvent.change(screen.getByLabelText("Term"), {
      target: { value: "F25" },
    });

    fireEvent.click(screen.getByTestId("CourseForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].data).toEqual(
      JSON.stringify({
        code: "CMPSC 156",
        name: "Advanced Applications Programming",
        term: "F25",
      }),
    );

    expect(mockToast).toHaveBeenCalledWith(
      "Course created - id: 12 code: CMPSC 156",
    );
    expect(mockedNavigate).toHaveBeenCalledWith({
      to: "/admin/listcourses",
    });
  });
});
