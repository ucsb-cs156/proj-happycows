import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminCoursesEditPage from "main/pages/AdminCoursesEditPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { schoolsFixtures } from "fixtures/schoolsFixtures";
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

describe("AdminCoursesEditPage tests", () => {
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
      axiosMock.onGet("/api/course/5").reply(200, {
        id: 5,
        code: "CS156",
        name: "Computer Science 156",
        term: "s26",
        school: { key: "OTHER", displayName: "Other", active: true },
      });
      axiosMock.onPut("/api/course/5").reply(200, {
        id: 5,
        code: "CS154",
        name: "Computer Science 154",
        term: "f26",
        school: { key: "UCSB", displayName: "UCSB", active: true },
      });
      axiosMock
        .onGet("/api/course/schools")
        .reply(200, schoolsFixtures.activeSchools);
    });

    const queryClient = new QueryClient();
    test("renders without crashing", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <AdminCoursesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <AdminCoursesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(await screen.findByLabelText(/Code/)).toBeInTheDocument();

      const codeField = screen.getByLabelText(/Code/);
      const nameField = screen.getByLabelText(/Name/);
      const termField = screen.getByLabelText(/Term/);

      expect(codeField).toHaveValue("CS156");
      expect(nameField).toHaveValue("Computer Science 156");
      expect(termField).toHaveValue("s26");

      expect(
        await screen.findByTestId("CoursesForm-school-UCSB"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("CoursesForm-school-OTHER"),
      ).toBeInTheDocument();
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <AdminCoursesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(await screen.findByLabelText(/Code/)).toBeInTheDocument();

      const codeField = screen.getByLabelText(/Code/);
      const nameField = screen.getByLabelText(/Name/);
      const termField = screen.getByLabelText(/Term/);

      expect(codeField).toHaveValue("CS156");
      expect(nameField).toHaveValue("Computer Science 156");
      expect(termField).toHaveValue("s26");

      const submitButton = screen.getByText("Update");

      expect(submitButton).toBeInTheDocument();

      fireEvent.change(codeField, { target: { value: "CS154" } });
      fireEvent.change(nameField, {
        target: { value: "Computer Science 154" },
      });
      fireEvent.change(termField, { target: { value: "f26" } });

      const schoolField = await screen.findByLabelText("School");
      fireEvent.change(schoolField, { target: { value: "UCSB" } });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toBeCalledWith(
        "Course Updated - id: 5 code: CS154 name: Computer Science 154",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/admin/listcourses" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 5 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          code: "CS154",
          name: "Computer Science 154",
          term: "f26",
          school: "UCSB",
        }),
      ); // posted object
    });
  });
});
