import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminCoursesEditPage from "main/pages/AdminCoursesEditPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
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
    useParams: () => ({
      id: 7,
    }),
    Navigate: (x) => {
      mockedNavigate(x);
      return null;
    },
  };
});

describe("AdminCoursesEditPage tests", () => {
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
    axiosMock.onGet("/api/course/7").reply(200, {
      id: 7,
      code: "CHEM 123",
      name: "Environmental Chemistry",
      term: "W26",
    });

    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <AdminCoursesEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Edit Course")).toBeInTheDocument();
    expect(await screen.findByLabelText("Course Code")).toHaveValue(
      "CHEM 123",
    );
    expect(screen.getByLabelText("Course Name")).toHaveValue(
      "Environmental Chemistry",
    );
    expect(screen.getByLabelText("Term")).toHaveValue("W26");
  });

  test("submits updated course and redirects", async () => {
    setupUserOnly();
    axiosMock.onGet("/api/course/7").reply(200, {
      id: 7,
      code: "CHEM 123",
      name: "Environmental Chemistry",
      term: "W26",
    });
    axiosMock.onPut("/api/course/7").reply(200, {
      id: 7,
      code: "CHEM 123",
      name: "Advanced Environmental Chemistry",
      term: "S26",
    });

    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <AdminCoursesEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByLabelText("Course Code")).toHaveValue(
      "CHEM 123",
    );

    fireEvent.change(screen.getByLabelText("Course Name"), {
      target: { value: "Advanced Environmental Chemistry" },
    });
    fireEvent.change(screen.getByLabelText("Term"), {
      target: { value: "S26" },
    });

    fireEvent.click(screen.getByTestId("CourseForm-submit"));

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    expect(axiosMock.history.put[0].data).toEqual(
      JSON.stringify({
        code: "CHEM 123",
        name: "Advanced Environmental Chemistry",
        term: "S26",
      }),
    );

    expect(mockToast).toHaveBeenCalledWith(
      "Course updated - id: 7 code: CHEM 123",
    );
    expect(mockedNavigate).toHaveBeenCalledWith({
      to: "/admin/listcourses",
    });
  });
});
