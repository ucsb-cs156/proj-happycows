import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";

import ChatDisplay from "main/components/Chat/ChatDisplay";
import userCommonsFixtures from "fixtures/userCommonsFixtures";
import { chatMessageFixtures } from "fixtures/chatMessageFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

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

    expect(screen.getByTestId("load-button")).toBeInTheDocument();
    expect(screen.getByTestId("load-button")).toHaveStyle(
      "backgroundColor: #0d6efd",
    );
    expect(screen.getByTestId("load-button")).toHaveStyle("color: white");
    expect(screen.getByTestId("load-button")).toHaveStyle("borderRadius: 8px");
    expect(screen.getByTestId("load-button")).toHaveStyle(
      "borderColor: #0d6efd",
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
      size: 100,
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
    expect(axiosMock.history.get[0].url).toBe("/api/currentUser");
    expect(axiosMock.history.get[1].url).toBe("/api/chat/get");
    expect(axiosMock.history.get[1].params).toEqual({
      commonsId: 1,
      page: 0,
      size: 100,
    });
    expect(axiosMock.history.get[2].url).toBe("/api/usercommons/commons/all");
    expect(axiosMock.history.get[2].params).toEqual({ commonsId: 1 });

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

  test("displays cuts off at 100 messages", async () => {
    //arrange

    axiosMock
      .onGet("/api/chat/get")
      .reply(200, { content: chatMessageFixtures.oneHundredMessages });
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
      expect(axiosMock.history.get.length).toBe(3);
    });
    expect(axiosMock.history.get[0].url).toBe("/api/currentUser");
    expect(axiosMock.history.get[1].url).toBe("/api/chat/get");
    expect(axiosMock.history.get[1].params).toEqual({
      commonsId: 1,
      page: 0,
      size: 100,
    });
    expect(axiosMock.history.get[2].url).toBe("/api/usercommons/commons/all");
    expect(axiosMock.history.get[2].params).toEqual({ commonsId: 1 });

    await waitFor(() => {
      expect(screen.getByTestId("ChatMessageDisplay-11")).toBeInTheDocument();
    });

    expect(screen.getByTestId("ChatMessageDisplay-12")).toBeInTheDocument();
    expect(screen.getByTestId("ChatMessageDisplay-3")).toBeInTheDocument();

    expect(
      screen.queryByTestId("ChatMessageDisplay-1"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("ChatMessageDisplay-2"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("This should not appear"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("This should also be cut off"),
    ).not.toBeInTheDocument();

    expect(screen.getByText("This should appear, though")).toBeInTheDocument();
    expect(screen.getByText("This one too!")).toBeInTheDocument();
  });

  test("no reload message button on latest page", async () => {
    axiosMock
      .onGet("/api/chat/get")
      .reply(200, { content: chatMessageFixtures.threeChatMessages });
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, [{ userId: 1 }]);
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await waitFor(() => {
      expect(screen.queryByText("Reload messages.")).not.toBeInTheDocument();
    });
  });

  test("reload button exists and works after loading more messages", async () => {
    axiosMock
      .onGet("/api/chat/get")
      .reply(200, { content: chatMessageFixtures.oneHundredMessages });
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, [{ userId: 1 }]);
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const loadButton = await screen.findByText("Load more messages.");
    loadButton.click();
    const reloadButton = await screen.findByText("Reload messages.");
    expect(reloadButton).toBeInTheDocument();
    reloadButton.click();
  });

  test("load more button works properly when no more pages exist", async () => {
    axiosMock
      .onGet("/api/chat/get")
      .replyOnce(200, { content: chatMessageFixtures.oneHundredMessages });
    axiosMock.onGet("/api/chat/get").replyOnce(200, { content: [] });
    axiosMock
      .onGet("/api/chat/get")
      .replyOnce(200, { content: chatMessageFixtures.oneHundredMessages });
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, [{ userId: 1 }]);
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    let isAlerted = false;
    window.alert = () => {
      isAlerted = true;
    };
    const loadButton = await screen.findByText("Load more messages.");
    loadButton.click();
    await waitFor(() => {
      if (!isAlerted) {
        throw new Error("Load more messages at cap failed.");
      }
    });
  });

  test("renders page with reload & load without crashing", async () => {
    axiosMock
      .onGet("/api/chat/get")
      .reply(200, { content: chatMessageFixtures.oneHundredMessages });
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, [{ userId: 1 }]);
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const loadButton = await screen.findByText("Load more messages.");
    loadButton.click();
    const reloadButton = await screen.findByText("Reload messages.");
    expect(reloadButton).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument();
    });

    expect(screen.getByTestId("ChatDisplay")).toHaveStyle("overflowY: scroll");
    expect(screen.getByTestId("ChatDisplay")).toHaveStyle("maxHeight: 300px");
    expect(screen.getByTestId("ChatDisplay")).toHaveStyle("display: flex");
    expect(screen.getByTestId("ChatDisplay")).toHaveStyle(
      "flexDirection: column-reverse",
    );

    expect(screen.getByTestId("load-button")).toBeInTheDocument();
    expect(screen.getByTestId("load-button")).toHaveStyle(
      "backgroundColor: #0d6efd",
    );
    expect(screen.getByTestId("load-button")).toHaveStyle("color: white");
    expect(screen.getByTestId("load-button")).toHaveStyle("borderRadius: 8px");
    expect(screen.getByTestId("load-button")).toHaveStyle(
      "borderColor: #0d6efd",
    );

    expect(screen.getByTestId("reload-button")).toBeInTheDocument();
    expect(screen.getByTestId("reload-button")).toHaveStyle(
      "backgroundColor: #0d6efd",
    );
    expect(screen.getByTestId("reload-button")).toHaveStyle("color: white");
    expect(screen.getByTestId("reload-button")).toHaveStyle(
      "borderRadius: 8px",
    );
    expect(screen.getByTestId("reload-button")).toHaveStyle(
      "borderColor: #0d6efd",
    );
  });
  test("displays three messages correctly with usernames in the correct order on page 1", async () => {
    //arrange
    axiosMock
      .onGet("/api/chat/get")
      .replyOnce(200, { content: chatMessageFixtures.oneHundredMessages });
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
    const loadButton = await screen.findByText("Load more messages.");
    loadButton.click();
    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(5);
    });
    expect(axiosMock.history.get[4].url).toBe("/api/chat/get");
    expect(axiosMock.history.get[4].params).toEqual({
      commonsId: 1,
      page: 1,
      size: 100,
    });
    expect(axiosMock.history.get[6].url).toBe("/api/usercommons/commons/all");
    expect(axiosMock.history.get[6].params).toEqual({ commonsId: 1 });

    const container = screen.getByTestId("ChatDisplay");

    await waitFor(() => {
      expect(container.children[4].getAttribute("data-testid")).toBe(
        "load-button",
      );
    });
    expect(container.children[3].getAttribute("data-testid")).toBe(
      "ChatMessageDisplay-1",
    );
    expect(container.children[2].getAttribute("data-testid")).toBe(
      "ChatMessageDisplay-2",
    );
    expect(container.children[1].getAttribute("data-testid")).toBe(
      "ChatMessageDisplay-3",
    );
    expect(container.children[0].getAttribute("data-testid")).toBe(
      "reload-button",
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
});
