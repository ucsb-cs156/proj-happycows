import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import PlayPage from "main/pages/PlayPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { vi } from "vitest";

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useParams: () => ({
    commonsId: 1,
  }),
}));

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  const toast = vi.fn((x) => mockToast(x));
  toast.error = vi.fn((x) => mockToast(x));
  toast.warn = vi.fn((x) => mockToast(x));

  return {
    __esModule: true,
    ...originalModule,
    toast,
  };
});

describe("PlayPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  let queryClient;
  let currentAnnouncements;

  const defaultUserCommons = {
    commonsId: 1,
    id: 1,
    totalWealth: 0,
    userId: 1,
    showChat: true,
  };

  const defaultCommonsPlus = {
    commons: {
      id: 1,
      name: "Sample Commons",
      showChat: true,
      hidden: false,
    },
    totalPlayers: 5,
    totalCows: 5,
  };

  const setupDefaultMocks = ({
    currentUser = apiCurrentUserFixtures.userOnly,
    systemInfo = systemInfoFixtures.showingNeither,
    userCommons = defaultUserCommons,
    commonsPlus = defaultCommonsPlus,
    commonsAll = [
      {
        id: 1,
        name: "Sample Commons",
        hidden: false,
      },
    ],
  } = {}) => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock.onGet("/api/currentUser").reply(200, currentUser);

    axiosMock.onGet("/api/systemInfo").reply(200, systemInfo);

    axiosMock
      .onGet("/api/usercommons/forcurrentuser", {
        params: { commonsId: 1 },
      })
      .reply(200, userCommons);

    axiosMock.onGet("/api/commons", { params: { id: 1 } }).reply(200, {
      id: 1,
      name: "Sample Commons",
    });

    axiosMock.onGet("/api/commons/all").reply(200, commonsAll);

    axiosMock
      .onGet("/api/commons/plus", {
        params: { id: 1 },
      })
      .reply(200, commonsPlus);

    axiosMock
      .onGet("/api/announcements/current")
      .reply(() => [200, currentAnnouncements]);

    axiosMock.onGet("/api/profits/all/commonsid").reply(200, []);

    axiosMock.onPut("/api/usercommons/sell").reply(200, userCommons);
    axiosMock.onPut("/api/usercommons/buy").reply(200, userCommons);
  };

  const renderPage = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PlayPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    currentAnnouncements = [];
    setupDefaultMocks();
  });

  test("renders without crashing", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("commonsPlay-title")).toBeInTheDocument();
    });

    for (const testId of [
      "CommonsOverview",
      "ManageCows",
      "playpage-chat-div",
    ]) {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    }

    expect(
      screen.queryByText(
        "This commons has been hidden by the site administrator.",
      ),
    ).not.toBeInTheDocument();
  });

  test("cannot join hidden commons", async () => {
    setupDefaultMocks({
      commonsAll: [
        {
          id: 1,
          name: "Sample Commons",
          hidden: true,
        },
      ],
      commonsPlus: {
        commons: {
          id: 1,
          name: "Sample Commons",
          showChat: true,
          hidden: true,
        },
        totalPlayers: 5,
        totalCows: 5,
      },
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText(
          "This commons has been hidden by the site administrator.",
        ),
      ).toBeInTheDocument();
    });

    for (const testId of [
      "commonsPlay-title",
      "CommonsOverview",
      "ManageCows",
      "playpage-chat-div",
    ]) {
      expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
    }
  });

  test("click buy button", async () => {
    renderPage();

    expect(await screen.findByTestId("buy-cow-button")).toBeInTheDocument();
    expect(
      screen.queryByText("This commons does not exist!"),
    ).not.toBeInTheDocument();

    const buyCowButton = screen.getByTestId("buy-cow-button");
    fireEvent.click(buyCowButton);

    const modalBuy = await screen.findByTestId("buy-sell-cow-modal");
    expect(modalBuy).toBeInTheDocument();

    const submitModalButton = screen.getByTestId("buy-sell-cow-modal-submit");
    fireEvent.click(submitModalButton);

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
  });

  test("click sell button", async () => {
    renderPage();

    expect(await screen.findByTestId("sell-cow-button")).toBeInTheDocument();

    const sellCowButton = screen.getByTestId("sell-cow-button");
    fireEvent.click(sellCowButton);

    const modalSell = await screen.findByTestId("buy-sell-cow-modal");
    expect(modalSell).toBeInTheDocument();

    const submitModalButton = screen.getByTestId("buy-sell-cow-modal-submit");
    fireEvent.click(submitModalButton);

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
  });

  test("Make sure that both the Announcements and Welcome Farmer components show up", async () => {
    renderPage();

    expect(await screen.findByText(/Announcements/)).toBeInTheDocument();
    expect(await screen.findByTestId("CommonsPlay")).toBeInTheDocument();
  });

  test("Make sure div has correct attributes", async () => {
    renderPage();

    const div = screen.getByTestId("playpage-div");
    expect(div).toHaveStyle("background-size: cover");
    expect(div.style.backgroundImage).toContain(
      "/src/assets/PlayPageBackground.jpg",
    );
  });

  test("Chat toggle button opens and closes the ChatPanel", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("playpage-chat-toggle")).toBeInTheDocument();
    });

    const chatToggleButton = screen.getByTestId("playpage-chat-toggle");
    expect(chatToggleButton).toBeInTheDocument();

    expect(screen.queryByTestId("ChatPanel")).not.toBeInTheDocument();

    fireEvent.click(chatToggleButton);

    await waitFor(() => {
      expect(screen.getByTestId("ChatPanel")).toBeInTheDocument();
    });

    fireEvent.click(chatToggleButton);

    await waitFor(() => {
      expect(screen.queryByTestId("ChatPanel")).not.toBeInTheDocument();
    });
  });

  test("Chat button and container have correct styles", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("playpage-chat-toggle")).toBeInTheDocument();
    });

    const chatButton = screen.getByTestId("playpage-chat-toggle");
    const chatContainer = screen.getByTestId("playpage-chat-div");

    expect(chatButton).toHaveTextContent("💬");

    const messageIcon = screen.getByTestId("message-icon");
    expect(messageIcon).toHaveStyle("font-family: Arial, sans-serif;");
    expect(messageIcon).toHaveStyle("font-size: 30px;");

    fireEvent.click(chatButton);

    await waitFor(() => {
      expect(chatButton).toHaveTextContent("❌");
    });

    const closeIcon = screen.getByTestId("close-icon");
    expect(closeIcon).toHaveStyle("font-family: Arial, sans-serif;");
    expect(closeIcon).toHaveStyle("font-size: 30px;");

    expect(chatButton).toHaveStyle(`
  width: 60px;
  height: 60px;
  border-radius: 25%;
  position: fixed;
  bottom: 30px;
  right: 30px;
`);

    expect(["lightblue", "rgb(173, 216, 230)"]).toContain(
      chatButton.style.backgroundColor,
    );

    expect(["black", "rgb(0, 0, 0)"]).toContain(chatButton.style.color);

    expect(chatContainer).toHaveStyle(`
      width: 550px;
      position: fixed;
      bottom: 100px;
      right: 20px;
    `);
  });

  test("Buy and Sell Cows Modal is Closed by Default", () => {
    renderPage();

    expect(screen.queryByTestId("buy-sell-cow-modal")).not.toBeInTheDocument();
  });

  test("Buy and Sell Cows Modal closes when close button is clicked", async () => {
    renderPage();

    expect(await screen.findByTestId("buy-cow-button")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("buy-cow-button"));

    expect(await screen.findByTestId("buy-sell-cow-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("buy-sell-cow-modal-close"));

    await waitFor(() => {
      expect(
        screen.queryByTestId("buy-sell-cow-modal"),
      ).not.toBeInTheDocument();
    });
  });

  test("Buy and Sell Cows Modal closes when cancel button is clicked", async () => {
    renderPage();

    expect(await screen.findByTestId("buy-cow-button")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("buy-cow-button"));

    expect(await screen.findByTestId("buy-sell-cow-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("buy-sell-cow-modal-cancel"));

    await waitFor(() => {
      expect(
        screen.queryByTestId("buy-sell-cow-modal"),
      ).not.toBeInTheDocument();
    });
  });

  test("Doesn't show chat button for non-admins if showChat is false", async () => {
    setupDefaultMocks({
      userCommons: {
        commonsId: 1,
        id: 1,
        totalWealth: 0,
        userId: 1,
      },
      commonsPlus: {
        commons: {
          id: 1,
          name: "Sample Commons",
          showChat: false,
          hidden: false,
        },
        totalPlayers: 5,
        totalCows: 5,
      },
      commonsAll: [
        {
          id: 1,
          name: "Sample Commons",
          hidden: false,
        },
      ],
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.queryByTestId("playpage-chat-toggle"),
      ).not.toBeInTheDocument();
    });
  });

  test("Shows chat button for admins if showChat is false", async () => {
    setupDefaultMocks({
      currentUser: apiCurrentUserFixtures.adminUser,
      userCommons: {
        commonsId: 1,
        id: 1,
        totalWealth: 0,
        userId: 1,
      },
      commonsPlus: {
        commons: {
          id: 1,
          name: "Sample Commons",
          showChat: false,
          hidden: false,
        },
        totalPlayers: 5,
        totalCows: 5,
      },
      commonsAll: [
        {
          id: 1,
          name: "Sample Commons",
          hidden: false,
        },
      ],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("playpage-chat-toggle")).toBeInTheDocument();
    });
  });

  test("User that has not joined any commons is trying to access an unjoined common", async () => {
    setupDefaultMocks({
      currentUser: {
        user: {
          id: 1,
          email: "pconrad.cis@gmail.com",
          googleSub: "102656447703889917227",
          pictureUrl:
            "https://lh3.googleusercontent.com/a-/AOh14GhpDBUt8eCEqiRT45hrFbcimsX_h1ONn0dc3HV8Bp8=s96-c",
          fullName: "Phil Conrad",
          givenName: "Phil",
          familyName: "Conrad",
          emailVerified: true,
          locale: "en",
          hostedDomain: null,
          admin: false,
          commons: [],
        },
        roles: [
          {
            authority: "ROLE_USER",
          },
        ],
      },
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("You have yet to join this commons!"),
      ).toBeInTheDocument();
    });

    expect(screen.queryByTestId("commons-card")).not.toBeInTheDocument();
  });

  test("User that has joined one commons is trying to access an unjoined common", async () => {
    setupDefaultMocks({
      currentUser: {
        user: {
          id: 1,
          email: "pconrad.cis@gmail.com",
          googleSub: "102656447703889917227",
          pictureUrl:
            "https://lh3.googleusercontent.com/a-/AOh14GhpDBUt8eCEqiRT45hrFbcimsX_h1ONn0dc3HV8Bp8=s96-c",
          fullName: "Phil Conrad",
          givenName: "Phil",
          familyName: "Conrad",
          emailVerified: true,
          locale: "en",
          hostedDomain: null,
          admin: false,
          commons: [
            {
              id: 4,
              name: "Commons4",
            },
          ],
        },
        roles: [
          {
            authority: "ROLE_USER",
          },
        ],
      },
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("You have yet to join this commons!"),
      ).toBeInTheDocument();
    });

    expect(screen.queryByTestId("commons-card")).not.toBeInTheDocument();
  });

  test("User that has joined one commons is trying to access a joined common", async () => {
    setupDefaultMocks({
      currentUser: {
        user: {
          id: 1,
          email: "pconrad.cis@gmail.com",
          googleSub: "102656447703889917227",
          pictureUrl:
            "https://lh3.googleusercontent.com/a-/AOh14GhpDBUt8eCEqiRT45hrFbcimsX_h1ONn0dc3HV8Bp8=s96-c",
          fullName: "Phil Conrad",
          givenName: "Phil",
          familyName: "Conrad",
          emailVerified: true,
          locale: "en",
          hostedDomain: null,
          admin: false,
          commons: [
            {
              id: 1,
              name: "Commons1",
            },
          ],
        },
        roles: [
          {
            authority: "ROLE_USER",
          },
        ],
      },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Announcements")).toBeInTheDocument();
    });

    expect(
      screen.queryByText("You have yet to join this commons!"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("commons-card")).toBeInTheDocument();
  });

  test("User not allowed and hasn't matched any commons should have 'notallowed' true", async () => {
    setupDefaultMocks({
      currentUser: {
        user: {
          id: 1,
          email: "pconrad.cis@gmail.com",
          googleSub: "102656447703889917227",
          pictureUrl:
            "https://lh3.googleusercontent.com/a-/AOh14GhpDBUt8eCEqiRT45hrFbcimsX_h1ONn0dc3HV8Bp8=s96-c",
          fullName: "Phil Conrad",
          givenName: "Phil",
          familyName: "Conrad",
          emailVerified: true,
          locale: "en",
          hostedDomain: null,
          admin: false,
          commons: [
            {
              id: 4,
              name: "Commons4",
            },
          ],
        },
        roles: [
          {
            authority: "ROLE_USER",
          },
        ],
      },
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("You have yet to join this commons!"),
      ).toBeInTheDocument();
    });

    expect(screen.queryByText("Announcements")).not.toBeInTheDocument();
    expect(screen.queryByTestId("commons-card")).not.toBeInTheDocument();
  });

  test("User not allowed to access a commons that does not exist", async () => {
    setupDefaultMocks({
      currentUser: {
        user: {
          id: 1,
          email: "pconrad.cis@gmail.com",
          googleSub: "102656447703889917227",
          pictureUrl:
            "https://lh3.googleusercontent.com/a-/AOh14GhpDBUt8eCEqiRT45hrFbcimsX_h1ONn0dc3HV8Bp8=s96-c",
          fullName: "Phil Conrad",
          givenName: "Phil",
          familyName: "Conrad",
          emailVerified: true,
          locale: "en",
          hostedDomain: null,
          admin: false,
          commons: [
            {
              id: 4,
              name: "Commons4",
            },
          ],
        },
        roles: [
          {
            authority: "ROLE_USER",
          },
        ],
      },
      commonsPlus: undefined,
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("This commons does not exist!"),
      ).toBeInTheDocument();
    });
  });

  test("shows current announcements when user is allowed and announcements are loaded", async () => {
    currentAnnouncements = [
      {
        id: 1,
        announcementText: "This is a current announcement.",
      },
    ];

    renderPage();

    expect(
      await screen.findByTestId("CurrentAnnouncements"),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("This is a current announcement."),
    ).toBeInTheDocument();
  });

  test("does not show current announcements when user is not allowed", async () => {
    currentAnnouncements = [
      {
        id: 1,
        announcementText: "This announcement should not show.",
      },
    ];

    setupDefaultMocks({
      commonsPlus: {
        commons: {
          id: 999,
          name: "Different Commons",
          showChat: true,
          hidden: false,
        },
        totalPlayers: 5,
        totalCows: 5,
      },
    });

    renderPage();

    expect(
      await screen.findByText("You have yet to join this commons!"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("This announcement should not show."),
    ).not.toBeInTheDocument();
  });
});
