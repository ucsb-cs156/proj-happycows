import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import CommonsOverview from "main/components/Commons/CommonsOverview";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import commonsPlusFixtures from "fixtures/commonsPlusFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { vi } from "vitest";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useParams: () => ({
    commonsId: 1,
  }),
  useNavigate: () => mockNavigate,
}));

const queryClient = new QueryClient();
const axiosMock = new AxiosMockAdapter(axios);

describe("CommonsOverview tests", () => {
  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("Redirects to the LeaderboardPage for an admin when you click visit", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsOverview
            commonsPlus={commonsPlusFixtures.oneCommonsPlus[0]}
            currentUser={currentUserFixtures.adminUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(
      await screen.findByTestId("user-leaderboard-button"),
    ).toBeInTheDocument();
    const leaderboardButton = screen.getByTestId("user-leaderboard-button");
    fireEvent.click(leaderboardButton);
    expect(mockNavigate).toHaveBeenCalledWith("/leaderboard/4");
  });

  test("LeaderboardPage for an ordinary user when commons has showLeaderboard = true", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsOverview
            commonsPlus={commonsPlusFixtures.commonsPlusShowLeaderboardTrue}
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

  test("No LeaderboardPage for an ordinary user when commons has showLeaderboard = false", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsOverview
            commonsPlus={commonsPlusFixtures.oneCommonsPlus[0]}
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
