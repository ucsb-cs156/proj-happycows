import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import mockConsole from "tests/testutils/mockConsole";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminListGamePageV2 from "main/pages/AdminListGamePageV2";
import { FOCUS_SCROLL_MARGIN } from "main/utils/focusScrollUtils";
import gamePlusFixtures from "fixtures/gamePlusFixtures";
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

describe("AdminListGamePageV2 tests", () => {
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
    axiosMock.onGet("/api/game/allplus").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListGamePageV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Existing assertions
    expect(screen.getByText("Games")).toBeInTheDocument();
    expect(screen.getByText("Download All Stats")).toBeInTheDocument();

    // ✅ Stryker-killers for style mutants:
    // 1) <h2 style={{ margin: 0 }}>Games</h2>
    const heading = screen.getByRole("heading", { name: "Games" });
    expect(heading).toHaveStyle("margin: 0px");

    // 2) Download All Stats button style={{ borderRadius: "30px", padding: "10px 20px" }}
    const downloadAll = screen.getByRole("button", {
      name: "Download All Stats",
    });
    expect(downloadAll).toHaveAttribute("href", "/api/commonstats/downloadAll");
    expect(downloadAll).toHaveStyle("border-radius: 30px");
    expect(downloadAll).toHaveStyle("padding: 10px 20px");
  });

  test("renders without crashing for admin user", () => {
    setupAdminUser();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/game/allplus").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListGamePageV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText("Games")).toBeInTheDocument();
    expect(screen.getByText("Download All Stats")).toBeInTheDocument();
  });

  test("renders three game without crashing for admin user", async () => {
    setupAdminUser();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/game/allplus")
      .reply(200, gamePlusFixtures.threeGamePlus);

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListGamePageV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("AdminGameCard-1")).toBeInTheDocument();
    expect(screen.getByTestId("AdminGameCard-2")).toBeInTheDocument();
    expect(screen.getByTestId("AdminGameCard-3")).toBeInTheDocument();
    expect(document.getElementById("1")).toContainElement(
      screen.getByTestId("AdminGameCard-1"),
    );
    expect(document.getElementById("2")).toContainElement(
      screen.getByTestId("AdminGameCard-2"),
    );
    expect(document.getElementById("3")).toContainElement(
      screen.getByTestId("AdminGameCard-3"),
    );
    expect(screen.getByText("Download All Stats")).toBeInTheDocument();

    // ✅ Stryker-killers for animation style={{ animation: "fadeInDown 1s ease-out" }}
    // Find any element with that inline animation style and assert it.
    const animated = container.querySelector('[style*="fadeInDown"]');
    expect(animated).toBeInTheDocument();
    expect(animated).toHaveStyle("animation: fadeInDown 1s ease-out");
  });

  test("renders game sorted newest to oldest by id", async () => {
    setupAdminUser();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/game/allplus")
      .reply(200, [
        { game: { id: 1, name: "Anacapa" } },
        { game: { id: 3, name: "Santa Rosa" } },
        { game: { id: 2, name: "Santa Cruz" } },
      ]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListGamePageV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("AdminGameCard-1")).toBeInTheDocument();
    const cards = screen.getAllByTestId(/^AdminGameCard-\d+$/);
    expect(cards.map((card) => card.getAttribute("data-testid"))).toEqual([
      "AdminGameCard-3",
      "AdminGameCard-2",
      "AdminGameCard-1",
    ]);
  });

  const withScrollToMock = async (fn) => {
    const scrollToMock = vi.fn();
    const originalScrollTo = window.scrollTo;
    window.scrollTo = scrollToMock;
    try {
      await fn(scrollToMock);
    } finally {
      window.scrollTo = originalScrollTo;
    }
  };

  test("scrolls to the focused game and strips the focus param", async () => {
    setupAdminUser();
    mockedNavigate.mockClear();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/game/allplus")
      .reply(200, gamePlusFixtures.threeGamePlus);

    await withScrollToMock(async (scrollToMock) => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/admin/listgamev2?focus=2"]}>
            <AdminListGamePageV2 />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(await screen.findByTestId("AdminGameCard-2")).toBeInTheDocument();

      await waitFor(() => {
        expect(scrollToMock).toHaveBeenCalledTimes(1);
      });
      // jsdom reports zero geometry, so the expected top is
      // 0 (element top) + 0 (scrollY) - 0 (navbar height) - margin
      expect(scrollToMock).toHaveBeenCalledWith({
        top: -FOCUS_SCROLL_MARGIN,
        behavior: "smooth",
      });
      expect(mockedNavigate).toHaveBeenCalledWith("/admin/listgamev2", {
        replace: true,
      });
    });
  });

  test("waits for fresh data before scrolling when cached game are shown", async () => {
    setupAdminUser();
    mockedNavigate.mockClear();
    const queryClient = new QueryClient();
    // Simulate returning to the page with stale cached data from a prior visit
    queryClient.setQueryData(
      ["/api/game/allplus"],
      gamePlusFixtures.threeGamePlus,
    );

    let resolveFetch;
    const fetchGate = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    axiosMock
      .onGet("/api/game/allplus")
      .reply(() => fetchGate.then(() => [200, gamePlusFixtures.threeGamePlus]));

    await withScrollToMock(async (scrollToMock) => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/admin/listgamev2?focus=2"]}>
            <AdminListGamePageV2 />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      // Cached game render immediately, but the refetch is still in
      // flight; scrolling now would target a layout that may reshuffle
      // when fresh data arrives.
      expect(await screen.findByTestId("AdminGameCard-2")).toBeInTheDocument();
      expect(scrollToMock).not.toHaveBeenCalled();
      expect(mockedNavigate).not.toHaveBeenCalled();

      resolveFetch();

      await waitFor(() => {
        expect(scrollToMock).toHaveBeenCalledTimes(1);
      });
      expect(mockedNavigate).toHaveBeenCalledWith("/admin/listgamev2", {
        replace: true,
      });
    });
  });

  test("does not scroll or rewrite the URL when there is no focus param", async () => {
    setupAdminUser();
    mockedNavigate.mockClear();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/game/allplus")
      .reply(200, gamePlusFixtures.threeGamePlus);

    await withScrollToMock(async (scrollToMock) => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/admin/listgamev2"]}>
            <AdminListGamePageV2 />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(await screen.findByTestId("AdminGameCard-2")).toBeInTheDocument();
      expect(scrollToMock).not.toHaveBeenCalled();
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });

  test("strips the focus param without scrolling when the target is missing", async () => {
    setupAdminUser();
    mockedNavigate.mockClear();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/game/allplus")
      .reply(200, gamePlusFixtures.threeGamePlus);

    await withScrollToMock(async (scrollToMock) => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/admin/listgamev2?focus=99"]}>
            <AdminListGamePageV2 />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(await screen.findByTestId("AdminGameCard-2")).toBeInTheDocument();
      await waitFor(() => {
        expect(mockedNavigate).toHaveBeenCalledWith("/admin/listgamev2", {
          replace: true,
        });
      });
      expect(scrollToMock).not.toHaveBeenCalled();
    });
  });

  test("does not scroll or rewrite the URL when there are no game", async () => {
    setupAdminUser();
    mockedNavigate.mockClear();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/game/allplus").reply(200, []);

    await withScrollToMock(async (scrollToMock) => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/admin/listgamev2?focus=2"]}>
            <AdminListGamePageV2 />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await waitFor(() => {
        expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
      });
      expect(scrollToMock).not.toHaveBeenCalled();
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });

  test("renders empty state when backend unavailable, user only", async () => {
    setupUserOnly();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/game/allplus").timeout();
    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListGamePageV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    restoreConsole();
    expect(screen.queryByTestId("AdminGameCard-1")).not.toBeInTheDocument();
    expect(screen.getByText("Download All Stats")).toBeInTheDocument();
  });

  test("search bar filters game correctly", async () => {
    setupAdminUser();
    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/game/allplus")
      .reply(200, [
        { game: { id: 1, name: "Anacapa" } },
        { game: { id: 2, name: "Santa Cruz" } },
        { game: { id: 3, name: "Santa Rosa" } },
      ]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListGamePageV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("AdminGameCard-1")).toBeInTheDocument();
    expect(screen.getByTestId("AdminGameCard-2")).toBeInTheDocument();
    expect(screen.getByTestId("AdminGameCard-3")).toBeInTheDocument();

    const searchInput = screen.getByTestId("AdminListGamePage-Search");

    fireEvent.change(searchInput, { target: { value: "Santa" } });
    await waitFor(() => {
      expect(screen.queryByTestId("AdminGameCard-1")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("AdminGameCard-2")).toBeInTheDocument();
    expect(screen.getByTestId("AdminGameCard-3")).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "Cruz" } });
    await waitFor(() => {
      expect(screen.queryByTestId("AdminGameCard-3")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("AdminGameCard-2")).toBeInTheDocument();
    expect(screen.queryByTestId("AdminGameCard-1")).not.toBeInTheDocument();
  });
});
