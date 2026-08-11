import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminViewPlayPage from "main/pages/AdminViewPlayPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { vi } from "vitest";

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useParams: () => ({
    userId: 1,
    gameId: 1,
  }),
}));

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("AdminViewPlayPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

  beforeEach(() => {
    const farmer = {
      gameId: 1,
      id: 1,
      totalWealth: 0,
      userId: 1,
    };
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/farmer", {
        params: { userId: 1, gameId: 1 },
      })
      .reply(200, farmer);
    axiosMock.onGet("/api/game", { params: { id: 1 } }).reply(200, {
      id: 1,
      name: "Sample Game",
    });
    axiosMock.onGet("/api/game/all").reply(200, [
      {
        id: 1,
        name: "Sample Game",
      },
    ]);

    axiosMock.onGet("/api/game/plus", { params: { id: 1 } }).reply(200, {
      game: {
        id: 1,
        name: "Sample Game",
      },
      totalPlayers: 5,
      totalCows: 5,
    });
    axiosMock
      .onGet("/api/profits/all", {
        params: {
          userId: 1,
          gameId: 1,
        },
      })
      .reply(200, []);
    axiosMock.onPut("/api/farmer/sell").reply(200, farmer);
    axiosMock.onPut("/api/farmer/buy").reply(200, farmer);
  });

  test("renders without crashing", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminViewPlayPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  });

  test("Make sure that both the Announcements and Welcome Farmer components show up", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminViewPlayPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Announcements/)).toBeInTheDocument();
    expect(await screen.findByTestId("GamePlay")).toBeInTheDocument();
  });

  test("Chat toggle button opens and closes the ChatPanel", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminViewPlayPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("adminviewplaypage-chat-toggle"),
      ).toBeInTheDocument();
    });

    // Make sure the chat toggle button is visible
    const chatToggleButton = screen.getByTestId(
      "adminviewplaypage-chat-toggle",
    );
    expect(chatToggleButton).toBeInTheDocument();

    // Make sure the ChatPanel is not visible initially
    expect(screen.queryByTestId("ChatPanel")).not.toBeInTheDocument();

    // Click the chat toggle button to open the ChatPanel
    fireEvent.click(chatToggleButton);

    // Wait for the ChatPanel to become visible
    await waitFor(() => {
      expect(screen.getByTestId("ChatPanel")).toBeInTheDocument();
    });

    // Click the chat toggle button again to close the ChatPanel
    fireEvent.click(chatToggleButton);

    // Wait for the ChatPanel to become hidden
    await waitFor(() => {
      expect(screen.queryByTestId("ChatPanel")).not.toBeInTheDocument();
    });
  });

  test("Chat button and container have correct styles", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminViewPlayPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("adminviewplaypage-chat-toggle"),
      ).toBeInTheDocument();
    });

    const chatButton = screen.getByTestId("adminviewplaypage-chat-toggle");
    const chatContainer = screen.getByTestId("adminviewplaypage-chat-div");

    expect(chatButton).toHaveTextContent("▲");

    // Click the chat toggle button to open the ChatPanel
    fireEvent.click(chatButton);

    await waitFor(() => {
      expect(chatButton).toHaveTextContent("▼");
    });

    // Check styles for the chat button
    expect(chatButton).toHaveStyle(`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  position: fixed;
  bottom: 20px;
  right: 20px;
`);

    expect(["lightblue", "rgb(173, 216, 230)"]).toContain(
      chatButton.style.backgroundColor,
    );

    expect(["black", "rgb(0, 0, 0)"]).toContain(chatButton.style.color);

    // Check styles for the chat container
    expect(chatContainer).toHaveStyle(`
            width: 550px;
            position: fixed;
            bottom: 100px;
            right: 20px;
        `);
  });
  test("displays read-only banner", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminViewPlayPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText(/This is a Admin Feature for/),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Visiting Farmer/)).toBeInTheDocument();
    expect(await screen.findByText(/Play Page for game/)).toBeInTheDocument();

    const bannerElement = screen.getByTestId(
      "adminviewplaypage-read-only-banner",
    );

    expect(bannerElement).toHaveStyle(
      `
            background: rgb(240, 240, 240);
            padding: 10px;
            textAlign: center
            `,
    );
    expect(bannerElement).toHaveTextContent(
      "This is a Admin Feature for Phillip ConradVisiting Farmer 's Play Page for game Sample Game in Read Only Mode.",
    );
  });

  test("renders when farmer is falsy but gamePlus is truthy", async () => {
    // Mock the response so that farmer is falsy but gamePlus is truthy
    axiosMock.onGet("/api/game/plus", { params: { id: 1 } }).reply(200, {
      game: {
        id: 1,
        name: "Sample Game",
      },
      totalPlayers: 5,
      totalCows: 5,
    });

    axiosMock
      .onGet("/api/announcements/current", {
        params: { gameId: 1 },
      })
      .reply(200, []);

    axiosMock
      .onGet("/api/profits/all", {
        params: {
          userId: 1,
          gameId: 1,
        },
      })
      .reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminViewPlayPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Ensure that the component renders without crashing
    expect(
      await screen.findByText(/This is a Admin Feature for/),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Visiting Farmer/)).toBeInTheDocument();
    expect(await screen.findByText(/Play Page for game/)).toBeInTheDocument();
  });
  test("renders when farmer is truthy and gamePlus is falsy", async () => {
    axiosMock.onGet("/api/game/plus", { params: { id: 1 } }).reply(200, null);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminViewPlayPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Ensure that the component renders without crashing
    expect(
      await screen.findByText(/This is a Admin Feature for/),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Visiting Farmer/)).toBeInTheDocument();
    expect(await screen.findByText(/Play Page for game/)).toBeInTheDocument();
  });
  test("renders CardGroup when farmer and gamePlus are truthy", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminViewPlayPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Ensure that the component renders the CardGroup when conditions are met
    expect(
      await screen.findByTestId("adminviewplaypage-card-group"),
    ).toBeInTheDocument();
  });
});
