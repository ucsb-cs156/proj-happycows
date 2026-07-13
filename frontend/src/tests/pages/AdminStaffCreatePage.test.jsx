import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminStaffCreatePage from "main/pages/AdminStaffCreatePage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { coursesFixtures } from "fixtures/coursesFixtures";
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

describe("AdminStaffCreatePage tests", () => {
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
    axiosMock.onGet("/api/course/all").reply(200, coursesFixtures.threeCourses);
  });

  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminStaffCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Create Staff")).toBeInTheDocument();
  });

  test("When you fill in form and click submit, the right things happens", async () => {
    axiosMock.onPost("/api/staff").reply(200, {
      id: 5,
      lastName: "Smith",
      firstMiddleName: "Jordan",
      email: "jordansmith@ucsb.edu",
      courseId: 1,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminStaffCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Create Staff")).toBeInTheDocument();

    const lastNameField = screen.getByLabelText("Last Name");
    const firstMiddleNameField = screen.getByLabelText("First/Middle Name");
    const emailField = screen.getByLabelText("Email");
    const courseField = screen.getByLabelText("Course");
    const button = screen.getByTestId("StaffForm-submit");

    fireEvent.change(lastNameField, { target: { value: "Smith" } });
    fireEvent.change(firstMiddleNameField, { target: { value: "Jordan" } });
    fireEvent.change(emailField, {
      target: { value: "jordansmith@ucsb.edu" },
    });
    fireEvent.change(courseField, { target: { value: "1" } });
    fireEvent.click(button);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    const expectedStaff = {
      lastName: "Smith",
      firstMiddleName: "Jordan",
      email: "jordansmith@ucsb.edu",
      courseId: 1,
    };

    expect(axiosMock.history.post[0].data).toEqual(
      JSON.stringify(expectedStaff),
    );

    expect(mockedNavigate).toBeCalledWith({ to: "/admin/liststaff" });
  });

  test("pre-fills the course when a courseId query param is present", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin/createstaff?courseId=2"]}>
          <AdminStaffCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Course")).toHaveValue("2");
    });
  });
});
