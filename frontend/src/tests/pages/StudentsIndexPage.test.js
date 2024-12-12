import { render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import StudentsIndexPage from "main/pages/StudentsIndexPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { studentsFixtures } from "fixtures/studentsFixtures";
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

describe("StudentsIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "StudentsTable";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  test("Renders with Create Button for admin user", async () => {
    // arrange
    setupAdminUser();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/Students/all").reply(200, []);

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    await waitFor(() => {
      expect(screen.getByText(/Create Student/)).toBeInTheDocument();
    });
    const button = screen.getByText(/Create Student/);
    expect(button).toHaveAttribute("href", "/admin/Students/create");
  });

  test("renders three Students correctly for Admin user", async () => {
    // arrange
    setupUserOnly();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/Students/all")
      .reply(200, studentsFixtures.threeStudents);

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );
  });

  test("renders empty table when backend unavailable, user only", async () => {
    setupUserOnly();

    const queryClient = new QueryClient();
    axiosMock.onGet("/api/Students/all").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => { expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1); });

    restoreConsole();
    expect(screen.queryByTestId(`${testId}-cell-row-0-col-id`)).not.toBeInTheDocument();
  });

  test("ensures that 'GET' is explicitly passed to useBackend", async () => {
    setupUserOnly();
    const queryClient = new QueryClient();
  
    const spy = jest.spyOn(require("main/utils/useBackend"), "useBackend");
  
    axiosMock
      .onGet("/api/Students/all")
      .reply(200, studentsFixtures.threeStudents);
  
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  
    await waitFor(() => {
      expect(screen.getByTestId("StudentsTable-cell-row-0-col-id")).toHaveTextContent("1");
    });
  
    expect(spy).toHaveBeenCalledWith(
      ["/api/Students/all"], 
      { method: "GET", url: "/api/Students/all" }, 
      []
    );
    spy.mockRestore();
  });
});
