import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminStaffEditPage from "main/pages/AdminStaffEditPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { coursesFixtures } from "fixtures/coursesFixtures";
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

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    __esModule: true,
    ...originalModule,
    useParams: () => ({
      id: 5,
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("AdminStaffEditPage tests", () => {
  describe("tests where backend is working normally", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/course/all")
        .reply(200, coursesFixtures.threeCourses);
      axiosMock.onGet("/api/staff/5").reply(200, {
        id: 5,
        lastName: "Smith",
        firstMiddleName: "Jordan",
        email: "jordansmith@ucsb.edu",
        courseId: 1,
      });
      axiosMock.onPut("/api/staff/5").reply(200, {
        id: 5,
        lastName: "Smithson",
        firstMiddleName: "Jordy",
        email: "jordysmithson@ucsb.edu",
        courseId: 2,
      });
    });

    const queryClient = new QueryClient();
    test("renders without crashing", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <AdminStaffEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <AdminStaffEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(await screen.findByLabelText(/Last Name/)).toBeInTheDocument();

      const lastNameField = screen.getByLabelText(/Last Name/);
      const firstMiddleNameField = screen.getByLabelText(/First\/Middle Name/);
      const emailField = screen.getByLabelText(/Email/);

      expect(lastNameField).toHaveValue("Smith");
      expect(firstMiddleNameField).toHaveValue("Jordan");
      expect(emailField).toHaveValue("jordansmith@ucsb.edu");
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <AdminStaffEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(await screen.findByLabelText(/Last Name/)).toBeInTheDocument();

      const lastNameField = screen.getByLabelText(/Last Name/);
      const firstMiddleNameField = screen.getByLabelText(/First\/Middle Name/);
      const emailField = screen.getByLabelText(/Email/);
      const courseField = screen.getByLabelText(/Course/);

      const submitButton = screen.getByText("Update");

      expect(submitButton).toBeInTheDocument();

      fireEvent.change(lastNameField, { target: { value: "Smithson" } });
      fireEvent.change(firstMiddleNameField, { target: { value: "Jordy" } });
      fireEvent.change(emailField, {
        target: { value: "jordysmithson@ucsb.edu" },
      });
      fireEvent.change(courseField, { target: { value: "2" } });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toBeCalledWith(
        "Staff Updated - id: 5 lastName: Smithson email: jordysmithson@ucsb.edu",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/admin/liststaff" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          lastName: "Smithson",
          firstMiddleName: "Jordy",
          email: "jordysmithson@ucsb.edu",
          courseId: 2,
        }),
      );
    });
  });
});
