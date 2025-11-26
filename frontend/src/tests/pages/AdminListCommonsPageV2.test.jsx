import { render, screen, waitFor } from "@testing-library/react";
import mockConsole from "tests/testutils/mockConsole";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminListCommonsPageV2 from "main/pages/AdminListCommonPageV2";
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

describe("AdminListCommonPageV2 tests", () => {
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
          <AdminListCommonsPageV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText("Commons")).toBeInTheDocument();
    expect(screen.getByText("Download All Stats")).toBeInTheDocument();
  });

  test("renders without crashing for admin user", () => {
    setupAdminUser();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/commons/allplus").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonsPageV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText("Commons")).toBeInTheDocument();
    expect(screen.getByText("Download All Stats")).toBeInTheDocument();
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
          <AdminListCommonsPageV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("AdminCommonsCard-1")).toBeInTheDocument();
    expect(screen.getByTestId("AdminCommonsCard-2")).toBeInTheDocument();
    expect(screen.getByTestId("AdminCommonsCard-3")).toBeInTheDocument();
    expect(screen.getByText("Download All Stats")).toBeInTheDocument();
  });

  test("renders empty state when backend unavailable, user only", async () => {
    setupUserOnly();

    const queryClient = new QueryClient();
    axiosMock.onGet("/api/commons/allplus").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonsPageV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });
    restoreConsole();

    expect(screen.queryByTestId("AdminCommonsCard-1")).not.toBeInTheDocument();
    expect(screen.getByText("Download All Stats")).toBeInTheDocument();
  });
});
