import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import StudentsEditPage from "main/pages/StudentsEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import mockConsole from "jest-mock-console";

const mockToast = jest.fn();
jest.mock("react-toastify", () => {
  const originalModule = jest.requireActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    useParams: () => ({
      id: 17,
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("StudentsEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
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
      axiosMock.onGet("/api/Students", { params: { id: 17 } }).timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <StudentsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Student");
      expect(
        screen.queryByTestId("StudentsForm-id"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

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
      axiosMock.onGet("/api/Students", { params: { id: 17 } }).reply(200, {
        id: 1,
        perm: "1234567",
        lastName: "Song",
        firstMiddleName: "Alec J",
        courseId: "1234",
        email: "test@hotmail.com",
      });
      axiosMock.onPut("/api/Students").reply(200, {
        id: 1,
        perm: "1234567",
        lastName: "Song2",
        firstMiddleName: "Alec J2",
        courseId: "12342",
        email: "test2@hotmail.com",
      });
    });

    const queryClient = new QueryClient();
    test("renders without crashing", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <StudentsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("StudentsForm-lastName");
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <StudentsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("StudentsForm-perm");

      const permField = screen.getByTestId("StudentsForm-perm");
      const lastNameField = screen.getByTestId("StudentsForm-lastName");
      const firstMiddleNameField = screen.getByTestId(
        "StudentsForm-firstMiddleName",
      );
      const courseIdField = screen.getByTestId(
        "StudentsForm-courseId",
      );
      const emailField = screen.getByTestId(
        "StudentsForm-email",
      );
      const submitButton = screen.getByTestId("StudentsForm-submit");

      expect(permField).toHaveValue("1234567");
      expect(lastNameField).toHaveValue("Song");
      expect(firstMiddleNameField).toHaveValue("Alec J");
      expect(courseIdField).toHaveValue("1234");
      expect(emailField).toHaveValue("test@hotmail.com");
      expect(submitButton).toHaveTextContent("Update");
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <StudentsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByTestId("StudentsForm-email");

      const permField = screen.getByTestId("StudentsForm-perm");
      const lastNameField = screen.getByTestId("StudentsForm-lastName");
      const firstMiddleNameField = screen.getByTestId(
        "StudentsForm-firstMiddleName",
      );
      const emailField = screen.getByTestId(
        "StudentsForm-email",
      );
      const submitButton = screen.getByTestId("StudentsForm-submit");

      fireEvent.change(permField, {
        target: { value: "12345678" },
      });
      fireEvent.change(lastNameField, {
        target: { value: "Song2" },
      });
      fireEvent.change(firstMiddleNameField, {
        target: { value: "Alec J 2" },
      })
      fireEvent.change(emailField, {
        target: { value: "test2@hotmail.com" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Student Updated - id: 1",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/admin/Students" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          perm: "12345678",
          lastName: "Song2",
          firstMiddleName: "Alec J 2",
          courseId: "1234",
          email: "test2@hotmail.com",
        }),
      ); // posted object
    });
  });
});
