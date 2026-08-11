import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import GameOverview from "main/components/Game/GameOverview";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import gamePlusFixtures from "fixtures/gamePlusFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { vi } from "vitest";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useParams: () => ({
    gameId: 1,
  }),
  useNavigate: () => mockNavigate,
}));

const queryClient = new QueryClient();
const axiosMock = new AxiosMockAdapter(axios);

describe("GameOverview tests", () => {
  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("Redirects to the DashboardPage for an admin when you click visit", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GameOverview
            gamePlus={gamePlusFixtures.oneGamePlus[0]}
            currentUser={currentUserFixtures.adminUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText(/Today is day \d+!/)).toBeInTheDocument();
    expect(
      await screen.findByTestId("user-leaderboard-button"),
    ).toBeInTheDocument();
    const leaderboardButton = screen.getByTestId("user-leaderboard-button");
    fireEvent.click(leaderboardButton);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/4");
  });

  test("DashboardPage for an ordinary user when game has showLeaderboard = true", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GameOverview
            gamePlus={gamePlusFixtures.gamePlusShowLeaderboardTrue}
            currentUser={currentUserFixtures.userOnly}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await waitFor(() =>
      expect(
        screen.queryByTestId("user-leaderboard-button"),
      ).toBeInTheDocument(),
    );
  });

  test("No DashboardPage for an ordinary user when game has showLeaderboard = false", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GameOverview
            gamePlus={gamePlusFixtures.oneGamePlus[0]}
            currentUser={currentUserFixtures.userOnly}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await waitFor(() =>
      expect(
        screen.queryByTestId("user-leaderboard-button"),
      ).not.toBeInTheDocument(),
    );
  });
});
