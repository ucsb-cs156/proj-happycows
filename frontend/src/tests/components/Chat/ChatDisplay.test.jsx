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
          staleTime: 0,
          cacheTime: 0,
        },
      },
    });
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  afterEach(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
  });

  test("renders with refreshRate false (test branch)", async () => {
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
          <ChatDisplay commonsId={commonsId} refreshRate={false} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument(),
    );
  });

  test("renders with default refreshRate 2000 (normal usage)", async () => {
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
          <ChatDisplay commonsId={commonsId} refreshRate={2000} />{" "}
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument(),
    );
  });

  test("renders without crashing", async () => {
    axiosMock
      .onGet("/api/chat/get")
      .reply(200, { content: [], totalElements: 0 });
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} refreshRate={false} />
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
          <ChatDisplay commonsId={commonsId} refreshRate={false} />
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
          <ChatDisplay commonsId={commonsId} refreshRate={false} />
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
          <ChatDisplay commonsId={commonsId} refreshRate={false} />
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
          <ChatDisplay commonsId={commonsId} refreshRate={false} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("ChatDisplay-viewAll")).not.toBeInTheDocument();
  });

  test("boundary: shows view all link when totalElements is exactly 10", async () => {
    const tenMessages = chatMessageFixtures.twelveChatMessages.slice(0, 10);

    axiosMock.onGet("/api/chat/get").reply(200, {
      content: tenMessages,
      totalElements: 10,
    });
    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} refreshRate={false} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument();
    });

    expect(screen.getByTestId("ChatDisplay-viewAll")).toBeInTheDocument();
    expect(screen.getByText("View all 10 messages")).toBeInTheDocument();
  });

  test("view all link container has correct styling", async () => {
    const twelveChatMessages = chatMessageFixtures.twelveChatMessages || [];

    axiosMock.onGet("/api/chat/get").reply(200, {
      content: twelveChatMessages,
      totalElements: 12,
    });
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} refreshRate={false} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatDisplay-viewAll")).toBeInTheDocument();
    });

    const viewAllContainer = screen.getByTestId("ChatDisplay-viewAll");

    expect(viewAllContainer).toHaveStyle({
      padding: "8px",
      textAlign: "center",
      backgroundColor: "#f8f9fa",
      borderBottom: "1px solid #dee2e6",
    });
  });

  test("message list container has correct styles for scrolling and layout", async () => {
    axiosMock.onGet("/api/chat/get").reply(200, {
      content: chatMessageFixtures.threeChatMessages,
      totalElements: 3,
    });
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} refreshRate={false} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatMessageDisplay-1")).toBeInTheDocument();
    });

    const messageElement = screen.getByTestId("ChatMessageDisplay-1");
    const scrollContainer = messageElement.parentElement;

    expect(scrollContainer).toHaveStyle({
      display: "flex",
      flexDirection: "column-reverse",
      overflowY: "scroll",
      maxHeight: "300px",
    });
  });

  test("shows view all link when messages > 10", async () => {
    const twelveChatMessages = chatMessageFixtures.twelveChatMessages;
    axiosMock
      .onGet("/api/chat/get")
      .reply(200, { content: twelveChatMessages, totalElements: 25 });
    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} refreshRate={false} />
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

  test("limits rendered messages to initialMessagePageSize (10)", async () => {
    const twelveMessages = chatMessageFixtures.twelveChatMessages;

    axiosMock.onGet("/api/chat/get").reply(200, {
      content: twelveMessages,
      totalElements: 12,
    });
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} refreshRate={false} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument();
    });

    const renderedMessages = screen.getAllByTestId(/^ChatMessageDisplay-\d+$/);

    expect(renderedMessages.length).toBe(10);
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
          <ChatDisplay commonsId={commonsId} refreshRate={false} />
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
          <ChatDisplay commonsId={commonsId} refreshRate={false} />
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
          <ChatDisplay commonsId={commonsId} refreshRate={false} />
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
          <ChatDisplay commonsId={commonsId} refreshRate={false} />
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
