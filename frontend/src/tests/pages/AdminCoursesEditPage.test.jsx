import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import CoursesEditPage from "main/pages/AdminCoursesEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

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
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("CoursesEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/course/17").timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <CoursesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Course");
      expect(screen.queryByTestId("Course-name")).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/course/17").reply(200, {
        id: 17,
        code: "MATH 4A",
        name: "Linear Algebra",
        term: "S26",
      });
      axiosMock.onPut("/api/course/17").reply(200, {
        id: 17,
        code: "MATH 4B",
        name: "Differential Equations",
        term: "F26",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <CoursesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("CoursesForm-id");

      const idField = screen.getByTestId("CoursesForm-id");
      const codeField = screen.getByTestId("CoursesForm-code");
      const nameField = screen.getByTestId("CoursesForm-name");
      const termField = screen.getByTestId("CoursesForm-term");
      const submitButton = screen.getByTestId("CoursesForm-submit");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");
      expect(codeField).toBeInTheDocument();
      expect(codeField).toHaveValue("MATH 4A");
      expect(nameField).toBeInTheDocument();
      expect(nameField).toHaveValue("Linear Algebra");
      expect(termField).toBeInTheDocument();
      expect(termField).toHaveValue("S26");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(codeField, {
        target: { value: "MATH 4B" },
      });
      fireEvent.change(nameField, {
        target: { value: "Differential Equations" },
      });
      fireEvent.change(termField, {
        target: { value: "S26" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith("Course Updated - id: 17 code: MATH 4B");

      expect(mockNavigate).toBeCalledWith({ to: "/admin/listcourses" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].url).toBe("/api/course/17");
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          code: "MATH 4B",
          name: "Differential Equations",
          term: "S26",
        }),
      ); // posted object
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <CoursesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("CoursesForm-id");

      const idField = screen.getByTestId("CoursesForm-id");
      const codeField = screen.getByTestId("CoursesForm-code");
      const nameField = screen.getByTestId("CoursesForm-name");
      const termField = screen.getByTestId("CoursesForm-term");
      const submitButton = screen.getByTestId("CoursesForm-submit");

      expect(idField).toHaveValue("17");
      expect(codeField).toHaveValue("MATH 4A");
      expect(nameField).toHaveValue("Linear Algebra");
      expect(termField).toHaveValue("S26");
      expect(submitButton).toBeInTheDocument();

      fireEvent.change(codeField, {
        target: { value: "MATH 4B" },
      });
      fireEvent.change(nameField, {
        target: { value: "Differential Equations" },
      });
      fireEvent.change(termField, { target: { value: "F26" } });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith("Course Updated - id: 17 code: MATH 4B");
      expect(mockNavigate).toBeCalledWith({ to: "/admin/listcourses" });
    });
  });
});
