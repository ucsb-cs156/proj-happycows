import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import mockConsole from "tests/testutils/mockConsole";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminListCommonsV2 from "main/pages/AdminListCommonsV2";
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

describe("AdminListCommonsV2 tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    mockToast.mockClear();
    mockedNavigate.mockClear();
  });

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
          <AdminListCommonsV2 />
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
          <AdminListCommonsV2 />
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
          <AdminListCommonsV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/id: 1/)).toBeInTheDocument();
    expect(screen.getByText(/id: 2/)).toBeInTheDocument();
    expect(screen.getByText(/id: 3/)).toBeInTheDocument();
    expect(screen.getByText(/Commons \(Card view\)/)).toBeInTheDocument();
  });

  test("renders empty view when backend unavailable, user only", async () => {
    setupUserOnly();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/commons/allplus").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonsV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });
    restoreConsole();

    expect(screen.queryByText(/id: 1/)).not.toBeInTheDocument();
    expect(screen.getByText(/Commons \(Card view\)/)).toBeInTheDocument();
  });

  test("what happens when you click delete and confirm, admin", async () => {
    setupAdminUser();

    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/commons/allplus")
      .reply(200, commonsPlusFixtures.threeCommonsPlus);

    window.confirm = vi.fn(() => true);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonsV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/id: 1/)).toBeInTheDocument();

    const deleteButton = screen.getAllByText("Delete")[0];
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
    });

    expect(mockToast).toHaveBeenCalledWith("Commons with id 1 deleted");
  });

  test("what happens when you click delete and cancel, admin", async () => {
    setupAdminUser();

    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/commons/allplus")
      .reply(200, commonsPlusFixtures.threeCommonsPlus);

    window.confirm = vi.fn(() => false);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonsV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/id: 1/)).toBeInTheDocument();

    const deleteButton = screen.getAllByText("Delete")[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
    });

    expect(mockToast).not.toHaveBeenCalled();
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
          <AdminListCommonsV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/id: 1/)).toBeInTheDocument();

    const editButton = screen.getByTestId("AdminListCommonsV2-Manage-1");
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
          <AdminListCommonsV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/id: 1/)).toBeInTheDocument();

    const leaderboardButton = screen.getAllByText("Leaderboard")[0];
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
          <AdminListCommonsV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/id: 1/)).toBeInTheDocument();

    const statsElems = screen.getAllByText("Stats CSV");
    expect(statsElems.length).toBeGreaterThan(0);
    const statsCSV = statsElems[0];
    expect(statsCSV.getAttribute("href")).toContain(
      "/api/commonstats/download?commonsId=1",
    );
  });

  test("what happens when you click announcements as an admin", async () => {
    setupAdminUser();

    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/commons/allplus")
      .reply(200, commonsPlusFixtures.threeCommonsPlus);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonsV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/id: 1/)).toBeInTheDocument();

    const announcementButton = screen.getAllByText("Announcements")[0];
    expect(announcementButton).toBeInTheDocument();

    fireEvent.click(announcementButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/admin/announcements/1"),
    );
  });

  test("renders no cards when commons list is empty (admin)", async () => {
    setupAdminUser();

    const queryClient = new QueryClient();
    axiosMock.onGet("/api/commons/allplus").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonsV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Commons (Card view)")).toBeInTheDocument();
    expect(screen.queryByText("Edit")).toBeNull();
  });

  test("renders empty date strings when dates are missing", async () => {
    setupAdminUser();

    const queryClient = new QueryClient();
    const withNoDates = [
      {
        commons: {
          id: 99,
          name: "NoDates",
          cowPrice: 1,
          milkPrice: 1,
          startingBalance: 0,
          startingDate: null,
          lastDate: null,
          degradationRate: 0.1,
          showLeaderboard: false,
          showChat: false,
          capacityPerUser: 10,
          carryingCapacity: 100,
        },
        totalCows: 0,
        effectiveCapacity: 0,
      },
    ];
    axiosMock.onGet("/api/commons/allplus").reply(200, withNoDates);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonsV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const items = await screen.findAllByText(/NoDates/);
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items[0]).toBeInTheDocument();
  });
});
