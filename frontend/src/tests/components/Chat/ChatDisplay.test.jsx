import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import React from "react";

import ChatDisplay from "main/components/Chat/ChatDisplay";
import userCommonsFixtures from "fixtures/userCommonsFixtures";
import { chatMessageFixtures } from "fixtures/chatMessageFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { vi } from "vitest";

describe("ChatDisplay tests", () => {
  const queryClient = new QueryClient();

  const axiosMock = new AxiosMockAdapter(axios);

  const commonsId = 1;

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  test("renders without crashing", async () => {
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
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
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
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

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
  });

  test("displays one message correctly without usernames", async () => {
    //arrange

    axiosMock
      .onGet("/api/chat/get")
      .reply(200, { content: chatMessageFixtures.oneChatMessage });
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, [{ userId: 1 }]);

    //act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    //assert
    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(3);
    });
    expect(axiosMock.history.get[2].url).toBe("/api/currentUser");
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
  });

  test("loads 10 messages first, then 2 older messages after clicking More messages", async () => {
    axiosMock
      .onGet("/api/chat/get", {
        params: { commonsId: 1, page: 0, size: 10 },
      })
      .reply(200, {
        content: chatMessageFixtures.twelveChatMessages.slice(0, 10),
        last: false,
      });

    axiosMock
      .onGet("/api/chat/get", {
        params: { commonsId: 1, page: 1, size: 10 },
      })
      .reply(200, {
        content: chatMessageFixtures.twelveChatMessages.slice(10),
        last: true,
      });

    axiosMock
      .onGet("/api/usercommons/commons/all", {
        params: { commonsId: 1 },
      })
      .reply(200, userCommonsFixtures.tenUserCommons);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={1} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      const topLevel = screen.getAllByTestId(/^ChatMessageDisplay-\d+$/);
      expect(topLevel).toHaveLength(10);
    });

    expect(screen.getByTestId("MoreMessagesButton")).toBeInTheDocument();

    screen.getByTestId("MoreMessagesButton").click();

    await waitFor(() => {
      const topLevel = screen.getAllByTestId(/^ChatMessageDisplay-\d+$/);
      expect(topLevel).toHaveLength(12);
    });

    expect(screen.getByTestId("NoMoreMessages")).toBeInTheDocument();
  });

  test("initial render shows More messages button before data loads", () => {
    axiosMock.onGet("/api/chat/get").reply(() => new Promise(() => {}));
    axiosMock.onGet("/api/usercommons/commons/all").reply([]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={1} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("MoreMessagesButton")).toBeInTheDocument();
  });

  test("initial MoreMessagesButton appears before backend data arrives", () => {
    const queryClient = new QueryClient();

    const originalUseState = React.useState;

    const spy = vi.spyOn(React, "useState");

    spy.mockImplementation((initial) => {
      if (initial === false) {
        return [false, vi.fn()];
      }
      return originalUseState(initial);
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={1} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByTestId("MoreMessagesButton")).toBeInTheDocument();

    spy.mockRestore();
  });
});
