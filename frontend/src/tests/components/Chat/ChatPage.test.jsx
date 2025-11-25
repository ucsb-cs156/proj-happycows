import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router";
import ChatPage from "main/pages/ChatPage";
import userCommonsFixtures from "fixtures/userCommonsFixtures";
import { chatMessageFixtures } from "fixtures/chatMessageFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("ChatPage tests", () => {
  let queryClient = new QueryClient();
  const axiosMock = new AxiosMockAdapter(axios);

  const renderChatPage = (commonsId = "1") => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/chat/${commonsId}`]}>
          <Routes>
            <Route path="/chat/:commonsId" element={<ChatPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

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

  const mockCommonCalls = (
    messages = { content: [], totalPages: 0, totalElements: 0 },
    users = [],
  ) => {
    axiosMock.onGet("/api/chat/get").reply(200, messages);
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, users);
  };

  test("renders without crashing", async () => {
    mockCommonCalls();

    renderChatPage();

    await waitFor(() =>
      expect(screen.getByTestId("ChatPage")).toBeInTheDocument(),
    );
  });

  test("page size selector appears & has correct default options", async () => {
    mockCommonCalls();

    renderChatPage();

    await waitFor(() =>
      expect(screen.getByTestId("page-size-selector")).toBeInTheDocument(),
    );

    const selector = screen.getByTestId("page-size-selector");
    expect(selector).toHaveValue("10");

    const values = [...selector.options].map((opt) => opt.value);
    expect(values).toEqual(["10", "20", "50", "100"]);
  });

  test("shows empty state when no messages", async () => {
    mockCommonCalls();

    renderChatPage();

    await waitFor(() =>
      expect(screen.getByTestId("no-messages")).toBeInTheDocument(),
    );

    expect(screen.getByText("No messages found.")).toBeInTheDocument();

    expect(screen.getByTestId("page-info")).toHaveTextContent(
      "Page 1 of 1 (Total: 0 messages)",
    );

    expect(screen.queryByTestId("message-list")).not.toBeInTheDocument();
  });

  test("displays messages when present", async () => {
    mockCommonCalls(
      {
        content: chatMessageFixtures.threeChatMessages,
        totalPages: 1,
        totalElements: 3,
      },
      userCommonsFixtures.threeUserCommons,
    );

    renderChatPage();

    await waitFor(() =>
      expect(screen.getByTestId("message-list")).toBeInTheDocument(),
    );

    expect(screen.getByTestId("ChatMessageDisplay-1")).toBeInTheDocument();
    expect(screen.getByTestId("ChatMessageDisplay-2")).toBeInTheDocument();
    expect(screen.getByTestId("ChatMessageDisplay-3")).toBeInTheDocument();

    expect(screen.queryByTestId("no-messages")).not.toBeInTheDocument();
  });

  test("maps usernames correctly", async () => {
    mockCommonCalls(
      {
        content: chatMessageFixtures.threeChatMessages,
        totalPages: 1,
        totalElements: 3,
      },
      userCommonsFixtures.threeUserCommons,
    );

    renderChatPage();

    await waitFor(() =>
      expect(screen.getByTestId("ChatMessageDisplay-1")).toBeInTheDocument(),
    );

    expect(screen.getByTestId("ChatMessageDisplay-1-User")).toHaveTextContent(
      "George Washington",
    );
    expect(screen.getByTestId("ChatMessageDisplay-2-User")).toHaveTextContent(
      "Thomas Jefferson",
    );
    expect(screen.getByTestId("ChatMessageDisplay-3-User")).toHaveTextContent(
      "John Adams",
    );
  });

  test("page info displays correct numbers", async () => {
    mockCommonCalls(
      {
        content: chatMessageFixtures.threeChatMessages,
        totalPages: 1,
        totalElements: 3,
      },
      userCommonsFixtures.threeUserCommons,
    );

    renderChatPage();

    await waitFor(() =>
      expect(screen.getByTestId("page-info")).toBeInTheDocument(),
    );

    expect(screen.getByTestId("page-info")).toHaveTextContent(
      "Page 1 of 1 (Total: 3 messages)",
    );
  });

  test("changing page size triggers new API call with correct params", async () => {
    mockCommonCalls(
      {
        content: chatMessageFixtures.threeChatMessages,
        totalPages: 1,
        totalElements: 3,
      },
      userCommonsFixtures.threeUserCommons,
    );

    renderChatPage();

    await waitFor(() =>
      expect(screen.getByTestId("page-size-selector")).toBeInTheDocument(),
    );

    const selector = screen.getByTestId("page-size-selector");
    fireEvent.change(selector, { target: { value: "20" } });

    await waitFor(() => expect(selector).toHaveValue("20"));

    await waitFor(() => {
      const calls = axiosMock.history.get.filter(
        (req) => req.url === "/api/chat/get",
      );
      const last = calls[calls.length - 1];
      expect(last.params.size).toBe(20);
      expect(last.params.page).toBe(0);
    });
  });

  test("pagination controls hidden when only one page", async () => {
    mockCommonCalls(
      {
        content: chatMessageFixtures.threeChatMessages,
        totalPages: 1,
        totalElements: 3,
      },
      userCommonsFixtures.threeUserCommons,
    );

    renderChatPage();

    await waitFor(() =>
      expect(screen.getByTestId("ChatPage")).toBeInTheDocument(),
    );

    expect(screen.queryByTestId("pagination-first")).not.toBeInTheDocument();
    expect(screen.queryByTestId("pagination-prev")).not.toBeInTheDocument();
    expect(screen.queryByTestId("pagination-next")).not.toBeInTheDocument();
    expect(screen.queryByTestId("pagination-last")).not.toBeInTheDocument();
  });

  test("pagination controls show when multiple pages", async () => {
    mockCommonCalls(
      {
        content: chatMessageFixtures.threeChatMessages,
        totalPages: 5,
        totalElements: 50,
      },
      userCommonsFixtures.threeUserCommons,
    );

    renderChatPage();

    await waitFor(() =>
      expect(screen.getByTestId("pagination-first")).toBeInTheDocument(),
    );

    expect(screen.getByTestId("pagination-prev")).toBeInTheDocument();
    expect(screen.getByTestId("pagination-next")).toBeInTheDocument();
    expect(screen.getByTestId("pagination-last")).toBeInTheDocument();
    expect(screen.getByTestId("pagination-info")).toHaveTextContent(
      "Page 1 of 5",
    );
  });

  test("first/prev disabled on first page", async () => {
    mockCommonCalls(
      {
        content: chatMessageFixtures.threeChatMessages,
        totalPages: 5,
        totalElements: 50,
      },
      userCommonsFixtures.threeUserCommons,
    );

    renderChatPage();

    await waitFor(() =>
      expect(screen.getByTestId("pagination-first")).toBeInTheDocument(),
    );

    expect(screen.getByTestId("pagination-first")).toBeDisabled();
    expect(screen.getByTestId("pagination-prev")).toBeDisabled();
    expect(screen.getByTestId("pagination-next")).not.toBeDisabled();
    expect(screen.getByTestId("pagination-last")).not.toBeDisabled();
  });

  test("next button advances pages", async () => {
    axiosMock.onGet("/api/chat/get").reply((config) => {
      return [
        200,
        {
          content: chatMessageFixtures.threeChatMessages,
          totalPages: 3,
          totalElements: 30,
          number: config.params.page,
        },
      ];
    });

    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    renderChatPage();

    await waitFor(() =>
      expect(screen.getByTestId("pagination-next")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTestId("pagination-next"));

    await waitFor(() =>
      expect(screen.getByTestId("pagination-info")).toHaveTextContent(
        "Page 2 of 3",
      ),
    );
  });

  test("prev button goes backward", async () => {
    axiosMock.onGet("/api/chat/get").reply((config) => {
      return [
        200,
        {
          content: chatMessageFixtures.threeChatMessages,
          totalPages: 3,
          totalElements: 30,
          number: config.params.page,
        },
      ];
    });

    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    renderChatPage();

    await waitFor(() =>
      expect(screen.getByTestId("pagination-next")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTestId("pagination-next"));

    await waitFor(() =>
      expect(screen.getByTestId("pagination-info")).toHaveTextContent(
        "Page 2 of 3",
      ),
    );

    fireEvent.click(screen.getByTestId("pagination-prev"));

    await waitFor(() =>
      expect(screen.getByTestId("pagination-info")).toHaveTextContent(
        "Page 1 of 3",
      ),
    );
  });

  test("first button jumps to first page", async () => {
    axiosMock.onGet("/api/chat/get").reply((config) => {
      return [
        200,
        {
          content: chatMessageFixtures.threeChatMessages,
          totalPages: 5, // >1 → pagination renders
          totalElements: 50,
          number: config.params.page, // reflect current page
        },
      ];
    });

    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    renderChatPage();

    await waitFor(() =>
      expect(screen.getByTestId("pagination-next")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTestId("pagination-next"));

    await waitFor(() =>
      expect(screen.getByTestId("page-info")).toHaveTextContent("Page 2 of 5"),
    );

    fireEvent.click(screen.getByTestId("pagination-next"));

    await waitFor(() =>
      expect(screen.getByTestId("page-info")).toHaveTextContent("Page 3 of 5"),
    );

    fireEvent.click(screen.getByTestId("pagination-first"));

    await waitFor(() =>
      expect(screen.getByTestId("page-info")).toHaveTextContent("Page 1 of 5"),
    );
  });

  test("last button jumps to last page", async () => {
    axiosMock.onGet("/api/chat/get").reply((config) => {
      return [
        200,
        {
          content: chatMessageFixtures.threeChatMessages,
          totalPages: 5,
          totalElements: 50,
          number: config.params.page,
        },
      ];
    });

    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    renderChatPage();

    await waitFor(() =>
      expect(screen.getByTestId("pagination-last")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTestId("pagination-last"));

    await waitFor(() =>
      expect(screen.getByTestId("pagination-info")).toHaveTextContent(
        "Page 5 of 5",
      ),
    );

    expect(screen.getByTestId("pagination-next")).toBeDisabled();
    expect(screen.getByTestId("pagination-last")).toBeDisabled();
  });

  test("ChatMessageCreate component appears", async () => {
    mockCommonCalls();

    renderChatPage();

    await waitFor(() =>
      expect(screen.getByTestId("ChatMessageCreate")).toBeInTheDocument(),
    );
  });

  test("sorts messages in descending order by id (newest first)", async () => {
    const unsortedMessages = [
      {
        id: 1,
        userId: 1,
        message: "Oldest (ID 1)",
        timestamp: "2023-01-01T00:00:00",
      },
      {
        id: 3,
        userId: 1,
        message: "Newest (ID 3)",
        timestamp: "2023-01-03T00:00:00",
      },
      {
        id: 2,
        userId: 1,
        message: "Middle (ID 2)",
        timestamp: "2023-01-02T00:00:00",
      },
    ];

    mockCommonCalls(
      {
        content: unsortedMessages,
        totalPages: 1,
        totalElements: 3,
      },
      [{ userId: 1, username: "TestUser" }],
    );

    renderChatPage();

    await waitFor(() => {
      expect(screen.getByTestId("ChatMessageDisplay-3")).toBeInTheDocument();
    });

    const renderedMessages = screen.getAllByTestId(/^ChatMessageDisplay-\d+$/);

    expect(renderedMessages.length).toBe(3);

    expect(renderedMessages[0]).toHaveAttribute(
      "data-testid",
      "ChatMessageDisplay-3",
    );
    expect(renderedMessages[1]).toHaveAttribute(
      "data-testid",
      "ChatMessageDisplay-2",
    );
    expect(renderedMessages[2]).toHaveAttribute(
      "data-testid",
      "ChatMessageDisplay-1",
    );
  });
});
