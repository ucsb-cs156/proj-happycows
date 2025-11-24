import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";

import ChatDisplay from "main/components/Chat/ChatDisplay";
import userCommonsFixtures from "fixtures/userCommonsFixtures";
import { chatMessageFixtures } from "fixtures/chatMessageFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import { vi } from "vitest";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    Link: ({ children, to, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

describe("ChatDisplay tests", () => {
  let queryClient;
  const axiosMock = new AxiosMockAdapter(axios);
  const commonsId = 1;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  afterEach(() => {
    queryClient.clear();
  });

  test("renders without crashing", async () => {
    axiosMock
      .onGet("/api/chat/get")
      .reply(200, { content: [], totalElements: 0 });
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument();
    });
  });

  test("displays no messages correctly", async () => {
    axiosMock
      .onGet("/api/chat/get")
      .reply(200, { content: [], totalElements: 0 });
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument();
    });

    expect(screen.queryByText("Anonymous")).not.toBeInTheDocument();
    expect(screen.queryByText("George Washington")).not.toBeInTheDocument();
    expect(screen.queryByText("Hello World")).not.toBeInTheDocument();
  });

  test("displays three messages correctly with usernames in the correct order", async () => {
    axiosMock.onGet("/api/chat/get").reply(200, {
      content: chatMessageFixtures.threeChatMessages,
      totalElements: 3,
    });
    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatMessageDisplay-1")).toBeInTheDocument();
    });

    expect(screen.getByTestId("ChatMessageDisplay-2")).toBeInTheDocument();
    expect(screen.getByTestId("ChatMessageDisplay-3")).toBeInTheDocument();

    expect(screen.getByTestId("ChatMessageDisplay-1-User")).toHaveTextContent(
      "George Washington",
    );
    expect(
      screen.getByTestId("ChatMessageDisplay-1-Message"),
    ).toHaveTextContent("Hello World");

    expect(screen.getByTestId("ChatMessageDisplay-2-User")).toHaveTextContent(
      "Thomas Jefferson",
    );
    expect(screen.getByTestId("ChatMessageDisplay-3-User")).toHaveTextContent(
      "John Adams",
    );
  });

  test("displays one message correctly without usernames", async () => {
    axiosMock.onGet("/api/chat/get").reply(200, {
      content: chatMessageFixtures.oneChatMessage,
      totalElements: 1,
    });
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatMessageDisplay-1")).toBeInTheDocument();
    });

    expect(screen.getByTestId("ChatMessageDisplay-1-User")).toHaveTextContent(
      "Anonymous",
    );
    expect(
      screen.getByTestId("ChatMessageDisplay-1-Message"),
    ).toHaveTextContent("Hello World");
  });

  test("does not show view all link when messages <= 10", async () => {
    axiosMock.onGet("/api/chat/get").reply(200, {
      content: chatMessageFixtures.threeChatMessages,
      totalElements: 3,
    });
    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("ChatDisplay-viewAll")).not.toBeInTheDocument();
  });

  test("shows view all link when messages > 10", async () => {
    const twelveChatMessages = chatMessageFixtures.twelveChatMessages || [
      ...chatMessageFixtures.threeChatMessages,
      {
        id: 4,
        userId: 1,
        message: "Message 4",
        timestamp: "2023-08-18T03:00:00",
      },
      {
        id: 5,
        userId: 2,
        message: "Message 5",
        timestamp: "2023-08-18T03:01:00",
      },
      {
        id: 6,
        userId: 3,
        message: "Message 6",
        timestamp: "2023-08-18T03:02:00",
      },
      {
        id: 7,
        userId: 1,
        message: "Message 7",
        timestamp: "2023-08-18T03:03:00",
      },
      {
        id: 8,
        userId: 2,
        message: "Message 8",
        timestamp: "2023-08-18T03:04:00",
      },
      {
        id: 9,
        userId: 3,
        message: "Message 9",
        timestamp: "2023-08-18T03:05:00",
      },
      {
        id: 10,
        userId: 1,
        message: "Message 10",
        timestamp: "2023-08-18T03:06:00",
      },
      {
        id: 11,
        userId: 2,
        message: "Message 11",
        timestamp: "2023-08-18T03:07:00",
      },
      {
        id: 12,
        userId: 3,
        message: "Message 12",
        timestamp: "2023-08-18T03:08:00",
      },
    ];

    axiosMock
      .onGet("/api/chat/get")
      .reply(200, { content: twelveChatMessages, totalElements: 25 });
    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(screen.getByTestId("ChatDisplay-viewAll")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    expect(screen.getByText("View all 25 messages")).toBeInTheDocument();

    const link = screen.getByText("View all 25 messages").closest("a");
    expect(link).toHaveAttribute("href", "/chat/1");
  });

  test("handles empty content array", async () => {
    axiosMock.onGet("/api/chat/get").reply(200, {
      content: [],
      totalElements: 0,
    });
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument();
    });

    expect(screen.queryByTestId(/ChatMessageDisplay-/)).not.toBeInTheDocument();
  });

  test("handles missing totalElements field", async () => {
    axiosMock.onGet("/api/chat/get").reply(200, {
      content: chatMessageFixtures.threeChatMessages,
    });
    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("ChatDisplay-viewAll")).not.toBeInTheDocument();
  });

  test("sorts messages in descending order by id", async () => {
    const unsortedMessages = [
      { id: 2, userId: 1, message: "Second", timestamp: "2023-08-18T02:00:00" },
      { id: 1, userId: 1, message: "First", timestamp: "2023-08-18T01:00:00" },
      { id: 3, userId: 1, message: "Third", timestamp: "2023-08-18T03:00:00" },
    ];

    axiosMock.onGet("/api/chat/get").reply(200, {
      content: unsortedMessages,
      totalElements: 3,
    });
    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, [{ userId: 1, username: "TestUser" }]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatMessageDisplay-3")).toBeInTheDocument();
    });

    const messages = screen.getAllByTestId(/^ChatMessageDisplay-\d+$/);
    expect(messages[0]).toHaveAttribute("data-testid", "ChatMessageDisplay-3");
    expect(messages[1]).toHaveAttribute("data-testid", "ChatMessageDisplay-2");
    expect(messages[2]).toHaveAttribute("data-testid", "ChatMessageDisplay-1");
  });

  test("maps usernames correctly from userCommonsList", async () => {
    axiosMock.onGet("/api/chat/get").reply(200, {
      content: [
        { id: 1, userId: 5, message: "Test", timestamp: "2023-08-18T01:00:00" },
      ],
      totalElements: 1,
    });
    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, [{ userId: 5, username: "SpecificUser" }]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatMessageDisplay-1-User")).toHaveTextContent(
        "SpecificUser",
      );
    });
  });
});
