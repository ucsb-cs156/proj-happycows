import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import StudentsCreatePage from "main/pages/StudentsCreatePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

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
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("StudentsCreatePage tests", () => {
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
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("StudentsForm-email")).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const student = {
      id: 1,
      perm: "1234567",
      lastName: "Song",
      firstMiddleName: "Alec J",
      courseId: "156",
      email: "alecsong@ucsb.edu",
    };

    axiosMock.onPost("/api/Students/post").reply(202, student);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("StudentsForm-email")).toBeInTheDocument();
    });

    const emailField = screen.getByTestId(
      "StudentsForm-email",
    );
    const courseIdField = screen.getByTestId("StudentsForm-courseId");
    const lastNameField = screen.getByTestId(
      "StudentsForm-lastName",
    );
    const permField = screen.getByTestId("StudentsForm-perm");
    const firstMiddleNameField = screen.getByTestId("StudentsForm-firstMiddleName");
    fireEvent.change(emailField, {
      target: { value: "tester1@hotmail.com" },
    });
    fireEvent.change(courseIdField, { target: { value: "1562" } });
    fireEvent.change(lastNameField, {
      target: { value: "Song 2" },
    });
    fireEvent.change(permField, {
      target: { value: "7654321" },
    });
    fireEvent.change(firstMiddleNameField, { target: { value: "Alec J 2" } });

    const submitButton = screen.getByTestId("StudentsForm-submit");

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      email: "tester1@hotmail.com",
      courseId: "1562",
      lastName: "Song 2",
      perm: "7654321",
      firstMiddleName: "Alec J 2",
    });

    expect(mockToast).toBeCalledWith(
      "New Student Created - id: 1",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/admin/Students" });
  });
});
