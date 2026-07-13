import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import InstructorAdminShowPage from "main/pages/InstructorAdminShowPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { studentsFixtures } from "fixtures/studentsFixtures";
import { staffFixtures } from "fixtures/staffFixtures";
import { vi } from "vitest";

const mockedParams = { id: "1" };
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    __esModule: true,
    ...originalModule,
    useParams: () => mockedParams,
  };
});

describe("InstructorAdminShowPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/course/1").reply(200, {
      id: 1,
      code: "CMPSC 156",
      name: "Advanced Applications Programming",
      term: "F25",
    });
    axiosMock
      .onGet("/api/student/course/1")
      .reply(200, studentsFixtures.threeStudents);
    axiosMock.onGet("/api/staff/course/1").reply(200, staffFixtures.threeStaff);
  });

  test("renders the course title and Students tab by default", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <InstructorAdminShowPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("InstructorAdminShowPage-title"),
    ).toHaveTextContent("CMPSC 156 - Advanced Applications Programming (F25)");

    expect(
      await screen.findByTestId("StudentsTable-cell-row-0-col-id"),
    ).toBeInTheDocument();
  });

  test("Add Student button links to the create student page with courseId", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <InstructorAdminShowPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const addStudentButton = await screen.findByTestId(
      "InstructorAdminShowPage-addStudent",
    );
    expect(addStudentButton).toHaveAttribute(
      "href",
      "/admin/createstudents?courseId=1",
    );
  });

  test("Staff tab shows the Add Staff button and staff table", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <InstructorAdminShowPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const addStaffButton = await screen.findByTestId(
      "InstructorAdminShowPage-addStaff",
    );
    expect(addStaffButton).toHaveAttribute(
      "href",
      "/admin/createstaff?courseId=1",
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("StaffTable-cell-row-0-col-id"),
      ).toBeInTheDocument();
    });
  });

  test("renders a default title while the course is loading", async () => {
    axiosMock.onGet("/api/course/1").timeout();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <InstructorAdminShowPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("InstructorAdminShowPage-title"),
    ).toHaveTextContent("Course");
  });
});
