import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";

import ChatDisplay from "main/components/Chat/ChatDisplay";
import userCommonsFixtures from "fixtures/userCommonsFixtures";
import { chatMessageFixtures } from "fixtures/chatMessageFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import * as useBackendModule from "main/utils/useBackend";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("ChatDisplay tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const commonsId = 1;
  const renderChatDisplay = () =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders without crashing", async () => {
    renderChatDisplay();

    await waitFor(() => {
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument();
    });

    expect(screen.getByTestId("ChatDisplay")).toHaveStyle("overflowY: scroll");
    expect(screen.getByTestId("ChatDisplay")).toHaveStyle("maxHeight: 300px");
    expect(screen.getByTestId("ChatDisplay")).toHaveStyle("display: flex");
    expect(screen.getByTestId("ChatDisplay")).toHaveStyle(
      "flexDirection: column-reverse",
    );
  });

  test("displays no messages correctly", async () => {
    //arrange

    //act
    renderChatDisplay();
    //assert

    //assert

    await waitFor(() => {
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument();
    });

    expect(screen.queryByText("Anonymous")).not.toBeInTheDocument();
    expect(screen.queryByText("George Washington (1)")).not.toBeInTheDocument();
    expect(screen.queryByText("Hello World")).not.toBeInTheDocument();
    expect(screen.queryByText("2023-08-17 23:57:46")).not.toBeInTheDocument();
  });

  test("displays three messages correctly with usernames in the correct order", async () => {
    //arrange

    axiosMock
      .onGet("/api/chat/get")
      .reply(200, { content: chatMessageFixtures.threeChatMessages });
    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    //act
    renderChatDisplay();

    //assert
    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(2);
    });
    expect(axiosMock.history.get[0].url).toBe("/api/chat/get");
    expect(axiosMock.history.get[0].params).toEqual({
      commonsId: 1,
      page: 0,
      size: 10,
    });
    expect(axiosMock.history.get[1].url).toBe("/api/usercommons/commons/all");
    expect(axiosMock.history.get[1].params).toEqual({ commonsId: 1 });

    const container = screen.getByTestId("ChatDisplay");

    await waitFor(() => {
      expect(container.children[2].getAttribute("data-testid")).toBe(
        "ChatMessageDisplay-1",
      );
    });
    expect(container.children[1].getAttribute("data-testid")).toBe(
      "ChatMessageDisplay-2",
    );
    expect(container.children[0].getAttribute("data-testid")).toBe(
      "ChatMessageDisplay-3",
    );

    expect(screen.getByTestId("ChatMessageDisplay-1-User")).toHaveTextContent(
      "George Washington",
    );
    expect(
      screen.getByTestId("ChatMessageDisplay-1-Message"),
    ).toHaveTextContent("Hello World");
    expect(screen.getByTestId("ChatMessageDisplay-1-Date")).toHaveTextContent(
      "2023-08-17 23:57:46",
    );

    expect(screen.getByTestId("ChatMessageDisplay-2-User")).toHaveTextContent(
      "Thomas Jefferson",
    );
    expect(
      screen.getByTestId("ChatMessageDisplay-2-Message"),
    ).toHaveTextContent("Hello World How are you doing???");
    expect(screen.getByTestId("ChatMessageDisplay-2-Date")).toHaveTextContent(
      "2023-08-18 02:59:11",
    );

    expect(screen.getByTestId("ChatMessageDisplay-3-User")).toHaveTextContent(
      "John Adams",
    );
    expect(
      screen.getByTestId("ChatMessageDisplay-3-Message"),
    ).toHaveTextContent("This is another test for chat messaging");
    expect(screen.getByTestId("ChatMessageDisplay-3-Date")).toHaveTextContent(
      "2023-08-18 02:59:28",
    );

    expect(
      screen.queryByTestId("ChatDisplay-HistoryLink"),
    ).not.toBeInTheDocument();
  });

  test("displays one message correctly without usernames", async () => {
    //arrange

    axiosMock
      .onGet("/api/chat/get")
      .reply(200, { content: chatMessageFixtures.oneChatMessage });
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, [{ userId: 1 }]);

    //act
    renderChatDisplay();

    //assert
    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(2);
    });
    expect(axiosMock.history.get[0].url).toBe("/api/chat/get");
    expect(axiosMock.history.get[0].params).toEqual({
      commonsId: 1,
      page: 0,
      size: 10,
    });
    expect(axiosMock.history.get[1].url).toBe("/api/usercommons/commons/all");
    expect(axiosMock.history.get[1].params).toEqual({ commonsId: 1 });

    await waitFor(() => {
      expect(screen.getByTestId("ChatMessageDisplay-1")).toBeInTheDocument();
    });
    expect(screen.getByTestId("ChatMessageDisplay-1-User")).toHaveTextContent(
      "Anonymous",
    );
    expect(
      screen.getByTestId("ChatMessageDisplay-1-Message"),
    ).toHaveTextContent("Hello World");
    expect(screen.getByTestId("ChatMessageDisplay-1-Date")).toHaveTextContent(
      "2023-08-17 23:57:46",
    );

    expect(
      screen.queryByTestId("ChatDisplay-HistoryLink"),
    ).not.toBeInTheDocument();
  });

  test("displays at most 10 messages and shows history link when more exist", async () => {
    //arrange

    axiosMock
      .onGet("/api/chat/get")
      .reply(200, { content: chatMessageFixtures.twelveChatMessages });
    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    //act
    renderChatDisplay();

    //assert
    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(2);
    });
    expect(axiosMock.history.get[0].url).toBe("/api/chat/get");
    expect(axiosMock.history.get[0].params).toEqual({
      commonsId: 1,
      page: 0,
      size: 10,
    });
    expect(axiosMock.history.get[1].url).toBe("/api/usercommons/commons/all");
    expect(axiosMock.history.get[1].params).toEqual({ commonsId: 1 });

    await waitFor(() => {
      expect(screen.getByTestId("ChatMessageDisplay-12")).toBeInTheDocument();
    });

    expect(screen.getByTestId("ChatMessageDisplay-11")).toBeInTheDocument();
    expect(screen.getByTestId("ChatMessageDisplay-3")).toBeInTheDocument();

    expect(
      screen.queryByTestId("ChatMessageDisplay-2"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("ChatMessageDisplay-1"),
    ).not.toBeInTheDocument();

    expect(
      screen.getByTestId("ChatDisplay-HistoryLink"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("This should appear, though"),
    ).toBeInTheDocument();
    expect(screen.getByText("This one too!")).toBeInTheDocument();
  });

  test("shows history link when totalElements indicates more messages than returned", async () => {
    axiosMock.onGet("/api/chat/get").reply(200, {
      content: chatMessageFixtures.twelveChatMessages.slice(0, 10),
      totalElements: 12,
    });
    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    renderChatDisplay();

    await waitFor(() => {
      expect(screen.getByTestId("ChatMessageDisplay-10")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("ChatMessageDisplay-11")).not.toBeInTheDocument();
    expect(screen.getByTestId("ChatDisplay-HistoryLink")).toBeInTheDocument();
  });

  test("does not show history link when totalElements equals initial page size", async () => {
    axiosMock.onGet("/api/chat/get").reply(200, {
      content: chatMessageFixtures.twelveChatMessages.slice(0, 10),
      totalElements: 10,
    });
    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    renderChatDisplay();

    await waitFor(() => {
      expect(screen.getByTestId("ChatMessageDisplay-10")).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId("ChatDisplay-HistoryLink"),
    ).not.toBeInTheDocument();
  });

  test("history link points to the commons specific route", async () => {
    axiosMock.onGet("/api/chat/get").reply(200, {
      content: chatMessageFixtures.twelveChatMessages,
      totalElements: 12,
    });
    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    renderChatDisplay();

    const historyLink = await screen.findByRole("link", {
      name: /view full chat history/i,
    });

    expect(historyLink).toHaveAttribute("href", "/chat/1");
  });

  test("history link applies the expected styling", async () => {
    axiosMock.onGet("/api/chat/get").reply(200, {
      content: chatMessageFixtures.twelveChatMessages,
      totalElements: 12,
    });
    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    renderChatDisplay();

    const historyLinkContainer = await screen.findByTestId(
      "ChatDisplay-HistoryLink",
    );
    expect(historyLinkContainer).toHaveStyle("text-align: center");
    expect(historyLinkContainer).toHaveStyle("padding: 0.75rem 0 0.25rem");
    expect(historyLinkContainer).toHaveStyle("font-size: 0.9rem");
    expect(historyLinkContainer).toHaveStyle("color: #0d6efd");

    const link = await screen.findByRole("link", {
      name: /view full chat history/i,
    });
    expect(link).toHaveStyle("text-decoration: none");
  });

  test("ignores chat responses whose content field is not an array", async () => {
    axiosMock.onGet("/api/chat/get").reply(200, { content: "invalid" });
    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    renderChatDisplay();

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(2);
    });

    const container = screen.getByTestId("ChatDisplay");
    await waitFor(() => {
      expect(container.children.length).toBe(0);
    });
    expect(
      screen.queryByTestId("ChatDisplay-HistoryLink"),
    ).not.toBeInTheDocument();
  });

  test("handles user commons responses that are not arrays", async () => {
    const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");
    useBackendSpy.mockImplementation((queryKey) => {
      const key = Array.isArray(queryKey) ? queryKey[0] : "";
      if (key?.startsWith("/api/chat/get")) {
        return {
          data: {
            content: chatMessageFixtures.oneChatMessage,
            totalElements: 1,
          },
        };
      }
      if (key?.startsWith("/api/currentUser")) {
        return { data: { root: { user: { id: 1 }, roles: [] } } };
      }
      if (key?.startsWith("/api/usercommons/commons/all")) {
        return { data: { invalid: true } };
      }
      return { data: [] };
    });

    renderChatDisplay();

    await waitFor(() => {
      expect(screen.getByTestId("ChatMessageDisplay-1")).toBeInTheDocument();
    });
    expect(screen.getByTestId("ChatMessageDisplay-1-User")).toHaveTextContent(
      "Anonymous",
    );
  });

  test("renders when chat messages response is undefined", async () => {
    const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");
    useBackendSpy.mockImplementation((queryKey) => {
      const key = Array.isArray(queryKey) ? queryKey[0] : "";
      if (key?.startsWith("/api/chat/get")) {
        return { data: undefined };
      }
      return { data: [] };
    });

    renderChatDisplay();

    await waitFor(() => {
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument();
    });

    expect(screen.getByTestId("ChatDisplay").children.length).toBe(0);
    expect(
      screen.queryByTestId("ChatDisplay-HistoryLink"),
    ).not.toBeInTheDocument();
  });
});
