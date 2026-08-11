import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import HomePage from "main/pages/HomePage";
import gameFixtures from "fixtures/gameFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import getBackgroundImage from "main/components/Utils/HomePageBackground";
import { vi } from "vitest";

import "main/pages/HomePage.css";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useParams: () => ({
    gameId: 1,
  }),
  useNavigate: () => mockNavigate,
}));

describe("HomePage tests", () => {
  const queryClient = new QueryClient();
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/game/mycourses").reply(200, []);
  });

  test("renders without crashing when lists return empty list", async () => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/game/all").reply(200, []);
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const mainDiv = screen.getByTestId("HomePage-main-div");
    expect(mainDiv).toBeInTheDocument();

    const title = screen.getByTestId("homePage-title");
    expect(title).toBeInTheDocument();
    expect(typeof title.textContent).toBe("string");

    await waitFor(() => {
      expect(title.textContent).toEqual("Howdy Farmer Phillip");
    });
  });

  test("renders with default for game when api times out", () => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/game/all").timeout();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const mainDiv = screen.getByTestId("HomePage-main-div");
    expect(mainDiv).toBeInTheDocument();

    const title = screen.getByTestId("homePage-title");
    expect(title).toBeInTheDocument();
    expect(typeof title.textContent).toBe("string");
    expect(title.textContent).toEqual("Howdy Farmer Phillip");
  });

  test("expected CSS properties", () => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/game/all").reply(200, []);
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const title = screen.getByTestId("homePage-title");
    expect(title).toHaveAttribute("class", "animate-charcter");
  });

  test("renders without crashing when lists are full", () => {
    apiCurrentUserFixtures.userOnly.user.game = gameFixtures.oneGame;
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/game/all").reply(200, gameFixtures.threeGame);
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const title = screen.getByTestId("homePage-title");
    expect(title).toBeInTheDocument();
    expect(typeof title.textContent).toBe("string");
    expect(title.textContent).toEqual("Howdy Farmer Phillip");
  });

  test("Redirects to the PlayPage when you click visit", async () => {
    apiCurrentUserFixtures.userOnly.user.game = gameFixtures.oneGame;
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/game/all").reply(200, gameFixtures.threeGame);
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("gameCard-button-Visit-1"),
    ).toBeInTheDocument();
    const visitButton = screen.getByTestId("gameCard-button-Visit-1");
    fireEvent.click(visitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/play/1");
    });
  });

  test("Calls the callback when you click join", async () => {
    apiCurrentUserFixtures.userOnly.user.game = gameFixtures.oneGame;
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/game/all").reply(200, gameFixtures.threeGame);
    axiosMock.onPost("/api/game/join").reply(200, gameFixtures.threeGame[0]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("gameCard-button-Join-4"),
    ).toBeInTheDocument();
    const joinButton = screen.getByTestId("gameCard-button-Join-4");
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
    });
    expect(axiosMock.history.post[0].url).toBe("/api/game/join");
    expect(axiosMock.history.post[0].params).toEqual({ gameId: 4 });
  });

  test("Check hour null is working, and that the background image is set correctly", async () => {
    apiCurrentUserFixtures.userOnly.user.game = gameFixtures.oneGame;
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/game/all").reply(200, gameFixtures.threeGame);
    axiosMock.onPost("/api/game/join").reply(200, gameFixtures.threeGame[0]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage hour={12} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("gameCard-button-Join-4"),
    ).toBeInTheDocument();
    const joinButton = screen.getByTestId("gameCard-button-Join-4");
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
    });
    expect(axiosMock.history.post[0].url).toBe("/api/game/join");
    expect(axiosMock.history.post[0].params).toEqual({ gameId: 4 });
  });

  test("Home page intro card has the correct styles applied", async () => {
    apiCurrentUserFixtures.userOnly.user.game = gameFixtures.oneGame;
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/game/all").reply(200, gameFixtures.threeGame);
    axiosMock.onPost("/api/game/join").reply(200, gameFixtures.threeGame[0]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage hour={12} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("HomePage-intro-card"),
    ).toBeInTheDocument();

    const HomePageDiv = screen.getByTestId("HomePage-main-div");
    expect(HomePageDiv).toHaveStyle("backgroundSize: cover;");

    const Background = getBackgroundImage(12);
    expect(HomePageDiv).toHaveStyle(`backgroundImage: url(${Background});`);

    expect(
      await screen.findByTestId("HomePage-intro-card"),
    ).toBeInTheDocument();
  });

  test("hides a course-linked game the user is not eligible for", async () => {
    apiCurrentUserFixtures.userOnly.user.game = [];
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/game/all")
      .reply(200, [{ ...gameFixtures.threeGame[0], courseId: 99 }]);
    axiosMock.onGet("/api/game/mycourses").reply(200, [5]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("HomePage-intro-card");

    expect(
      screen.queryByTestId(
        `gameCard-button-Join-${gameFixtures.threeGame[0].id}`,
      ),
    ).not.toBeInTheDocument();
  });

  test("shows a course-linked game the user is eligible for", async () => {
    apiCurrentUserFixtures.userOnly.user.game = [];
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/game/all")
      .reply(200, [{ ...gameFixtures.threeGame[0], courseId: 5 }]);
    axiosMock.onGet("/api/game/mycourses").reply(200, [5]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId(
        `gameCard-button-Join-${gameFixtures.threeGame[0].id}`,
      ),
    ).toBeInTheDocument();
  });

  test("shows a course-linked game to an admin even when not on the roster", async () => {
    apiCurrentUserFixtures.adminUser.user.game = [];
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/game/all")
      .reply(200, [{ ...gameFixtures.threeGame[0], courseId: 99 }]);
    axiosMock.onGet("/api/game/mycourses").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId(
        `gameCard-button-Join-${gameFixtures.threeGame[0].id}`,
      ),
    ).toBeInTheDocument();
  });
});
