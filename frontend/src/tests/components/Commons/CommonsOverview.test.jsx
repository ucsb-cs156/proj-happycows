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

const axiosMock = new AxiosMockAdapter(axios);

const getQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const mockCurrentAnnouncements = (content = []) => {
  axiosMock.onGet("/api/announcements/current").reply(200, { content });
};

describe("CommonsOverview tests", () => {
  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockNavigate.mockClear();

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("Redirects to the LeaderboardPage for an admin when you click visit", async () => {
    mockCurrentAnnouncements();

    render(
      <QueryClientProvider client={getQueryClient()}>
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
    mockCurrentAnnouncements();

    render(
      <QueryClientProvider client={getQueryClient()}>
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
    mockCurrentAnnouncements();

    render(
      <QueryClientProvider client={getQueryClient()}>
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

  test("Displays current announcements when they are returned from the backend", async () => {
    mockCurrentAnnouncements([
      {
        id: 1,
        commonsId: 4,
        startDate: "2026-05-20T12:00:00",
        endDate: "2026-05-21T12:00:00",
        announcementText: "This is an active announcement",
      },
    ]);

    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <CommonsOverview
            commonsPlus={commonsPlusFixtures.oneCommonsPlus[0]}
            currentUser={currentUserFixtures.adminUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("CommonsOverview-announcement-1"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("This is an active announcement"),
    ).toBeInTheDocument();

    expect(screen.getByTestId("announcements-container")).toBeInTheDocument();
  });

  test("Does not display announcement alert when there are no announcements", async () => {
    mockCurrentAnnouncements();

    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <CommonsOverview
            commonsPlus={commonsPlusFixtures.oneCommonsPlus[0]}
            currentUser={currentUserFixtures.adminUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        screen.queryByTestId("announcements-container"),
      ).not.toBeInTheDocument(),
    );

    expect(
      screen.queryByText("This is an active announcement"),
    ).not.toBeInTheDocument();
  });
});
