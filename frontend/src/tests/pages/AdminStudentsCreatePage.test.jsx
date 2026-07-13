import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminStudentsCreatePage from "main/pages/AdminStudentsCreatePage";
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

describe("AdminStudentsCreatePage tests", () => {
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
          <AdminStudentsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Create Student")).toBeInTheDocument();
  });

  test("When you fill in form and click submit, the right things happens", async () => {
    axiosMock.onPost("/api/student").reply(200, {
      id: 5,
      lastName: "Ferber",
      firstMiddleName: "Sally",
      email: "sallyferber@ucsb.edu",
      perm: "1234567",
      courseId: 1,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminStudentsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Create Student")).toBeInTheDocument();

    const lastNameField = screen.getByLabelText("Last Name");
    const firstMiddleNameField = screen.getByLabelText("First/Middle Name");
    const emailField = screen.getByLabelText("Email");
    const permField = screen.getByLabelText("Perm Number");
    const courseField = screen.getByLabelText("Course");
    const button = screen.getByTestId("StudentsForm-submit");

    fireEvent.change(lastNameField, { target: { value: "Ferber" } });
    fireEvent.change(firstMiddleNameField, { target: { value: "Sally" } });
    fireEvent.change(emailField, {
      target: { value: "sallyferber@ucsb.edu" },
    });
    fireEvent.change(permField, { target: { value: "1234567" } });
    fireEvent.change(courseField, { target: { value: "1" } });
    fireEvent.click(button);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    const expectedStudent = {
      lastName: "Ferber",
      firstMiddleName: "Sally",
      email: "sallyferber@ucsb.edu",
      perm: "1234567",
      courseId: 1,
    };

    expect(axiosMock.history.post[0].data).toEqual(
      JSON.stringify(expectedStudent),
    );

    expect(mockToast).toBeCalledWith(
      <div>
        Student successfully created!
        <br />
        id: 5
        <br />
        lastName: Ferber
        <br />
        email: sallyferber@ucsb.edu
      </div>,
    );

    expect(mockedNavigate).toBeCalledWith({ to: "/admin/liststudents" });
  });

  test("pre-fills the course when a courseId query param is present", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin/createstudents?courseId=2"]}>
          <AdminStudentsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Course")).toHaveValue("2");
    });
  });
});
