import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import mockConsole from "tests/testutils/mockConsole";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminListCommonPage from "main/pages/AdminListCommonPage";
import commonsPlusFixtures from "fixtures/commonsPlusFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
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

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("AdminListCommonPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

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

  test("renders without crashing for regular user", () => {
    setupUserOnly();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/commons/allplus").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  });

  test("renders without crashing for admin user", () => {
    setupAdminUser();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/commons/allplus").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  });

  test("renders three commons without crashing for admin user", async () => {
    setupAdminUser();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/commons/allplus")
      .reply(200, commonsPlusFixtures.threeCommonsPlus);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("AdminCommonsCard-1")).toBeInTheDocument();
    expect(screen.getByTestId("AdminCommonsCard-2")).toBeInTheDocument();
    expect(screen.getByTestId("AdminCommonsCard-3")).toBeInTheDocument();
    expect(screen.getByText(`Download All Stats`)).toBeInTheDocument();
  });

  test("renders empty table when backend unavailable, user only", async () => {
    setupUserOnly();

    const queryClient = new QueryClient();
    axiosMock.onGet("/api/commons/allplus").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });
    restoreConsole();

    expect(screen.queryByTestId("AdminCommonsCard-1")).not.toBeInTheDocument();
    expect(screen.getByText(`Download All Stats`)).toBeInTheDocument();
  });

  test("what happens when you click delete, admin", async () => {
    setupAdminUser();

    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/commons/allplus")
      .reply(200, commonsPlusFixtures.threeCommonsPlus);
    axiosMock
      .onDelete("/api/commons", { params: { id: 1 } })
      .reply(200, "Commons with id 1 was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("AdminCommonsCard-1")).toBeInTheDocument();

    const deleteButton = screen.getByTestId("AdminCommonsCard-Delete-1");
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(
        screen.getByTestId("AdminCommonsCard-Modal-Delete-1"),
      ).toBeInTheDocument();
    });

    const modalDelete = screen.getByTestId("AdminCommonsCard-Modal-Delete-1");
    fireEvent.click(modalDelete);

    await waitFor(() => {
      expect(mockToast).toBeCalledWith("Commons with id 1 was deleted");
    });
  });

  test("what happens when you click edit as an admin", async () => {
    setupAdminUser();

    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/commons/allplus")
      .reply(200, commonsPlusFixtures.threeCommonsPlus);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("AdminCommonsCard-1")).toBeInTheDocument();

    const editButton = screen.getByTestId("AdminCommonsCard-Edit-1");
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/admin/editcommons/1"),
    );
  });

  test("what happens when you click leaderboard as an admin", async () => {
    setupAdminUser();

    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/commons/allplus")
      .reply(200, commonsPlusFixtures.threeCommonsPlus);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("AdminCommonsCard-1")).toBeInTheDocument();

    const leaderboardButton = screen.getByTestId("AdminCommonsCard-Leaderboard-1");
    expect(leaderboardButton).toBeInTheDocument();

    fireEvent.click(leaderboardButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/leaderboard/1"),
    );
  });

  test("correct href for stats csv button as an admin", async () => {
    setupAdminUser();

    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/commons/allplus")
      .reply(200, commonsPlusFixtures.threeCommonsPlus);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("AdminCommonsCard-1")).toBeInTheDocument();

    const statsCSVButton = screen.getByTestId("AdminCommonsCard-StatsCSV-1");
    expect(statsCSVButton).toHaveAttribute(
      "href",
      "/api/commonstats/download?commonsId=1",
    );
  });
});
