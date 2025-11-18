import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { vi } from "vitest";
import * as reactQuery from "react-query";
import * as useBackendModule from "main/utils/useBackend";

import ChatHistoryPage from "main/pages/ChatHistoryPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import userCommonsFixtures from "fixtures/userCommonsFixtures";
import { chatMessageFixtures } from "fixtures/chatMessageFixtures";

const observe = vi.fn();
const unobserve = vi.fn();
let intersectionCallback = null;

beforeAll(() => {
  globalThis.IntersectionObserver = vi.fn(function (callback) {
    intersectionCallback = callback;
    this.observe = observe;
    this.unobserve = unobserve;
    this.disconnect = vi.fn();
  });
});

beforeEach(() => {
  observe.mockClear();
  unobserve.mockClear();
  if (typeof globalThis.IntersectionObserver?.mockClear === "function") {
    globalThis.IntersectionObserver.mockClear();
  }
  intersectionCallback = null;
});

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    __esModule: true,
    ...actual,
    useParams: () => ({ commonsId: 1 }),
    useNavigate: () => mockNavigate,
  };
});

describe("ChatHistoryPage", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const setupCommonMocks = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockNavigate.mockClear();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/usercommons/commons/all", { params: { commonsId: 1 } })
      .reply(200, userCommonsFixtures.threeUserCommons);
  };

  const mockInfiniteQuery = (overrides = {}) => {
    const spy = vi.spyOn(reactQuery, "useInfiniteQuery");
    spy.mockReturnValue({
      data: { pages: [] },
      status: "success",
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
      ...overrides,
    });
    return spy;
  };

  test("renders chat messages and shows terminal status when no more pages", async () => {
    setupCommonMocks();
    axiosMock
      .onGet("/api/chat/get", { params: { commonsId: 1, page: 0, size: 25 } })
      .reply(200, {
        content: chatMessageFixtures.threeChatMessages,
        last: true,
      });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const container = await screen.findByTestId(
      "ChatHistoryPage-message-container",
    );

    expect(container).toHaveStyle("min-height: 50vh");
    expect(container).toHaveStyle("max-height: 70vh");
    expect(container).toHaveStyle("overflow-y: auto");
    expect(container).toHaveStyle("border: 1px solid #dee2e6");
    expect(container).toHaveStyle("border-radius: 0.5rem");
    expect(container).toHaveStyle("padding: 1rem");
    expect(container).toHaveStyle("background-color: white");

    expect(screen.getByTestId("ChatMessageDisplay-1")).toBeInTheDocument();
    expect(screen.getByTestId("ChatMessageDisplay-1-User")).toHaveTextContent(
      "George Washington",
    );
    expect(screen.getByText("[no more messages]")).toBeInTheDocument();
    expect(screen.queryByText(/Loading messages.../i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Unable to load chat messages/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/No messages available for this commons/i),
    ).not.toBeInTheDocument();
  });

  test("falls back to anonymous usernames when user commons are missing data", async () => {
    setupCommonMocks();
    axiosMock
      .onGet("/api/usercommons/commons/all", { params: { commonsId: 1 } })
      .reply(200, [{ userId: 1 }]);
    axiosMock
      .onGet("/api/chat/get", { params: { commonsId: 1, page: 0, size: 25 } })
      .reply(200, {
        content: chatMessageFixtures.oneChatMessage,
        last: true,
      });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        screen.getByTestId("ChatMessageDisplay-1-User"),
      ).toBeInTheDocument(),
    );
    expect(screen.getByTestId("ChatMessageDisplay-1-User")).toHaveTextContent(
      "Anonymous",
    );
  });

  test("clicking back navigates to previous page", async () => {
    setupCommonMocks();
    axiosMock
      .onGet("/api/chat/get", { params: { commonsId: 1, page: 0, size: 25 } })
      .reply(200, {
        content: [],
        last: true,
      });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const backButton = await screen.findByTestId("ChatHistoryPage-back");
    fireEvent.click(backButton);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(-1));
  });

  test("shows loading indicator while initial messages fetch", async () => {
    setupCommonMocks();
    const useInfiniteQuerySpy = mockInfiniteQuery({
      status: "loading",
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Loading messages.../i)).toBeInTheDocument();
    expect(
      screen.queryByText(/No messages available for this commons/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Unable to load chat messages/i),
    ).not.toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("shows error message when chat query fails", async () => {
    setupCommonMocks();
    const useInfiniteQuerySpy = mockInfiniteQuery({
      status: "error",
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByText(/Unable to load chat messages/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Loading messages.../i)).not.toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("shows empty state when there are no messages after loading", async () => {
    setupCommonMocks();
    const useInfiniteQuerySpy = mockInfiniteQuery({
      status: "success",
      data: { pages: [{ content: [] }] },
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByText(/No messages available for this commons/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Loading messages.../i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Unable to load chat messages/i),
    ).not.toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("renders empty state when query data is undefined", async () => {
    setupCommonMocks();
    const useInfiniteQuerySpy = mockInfiniteQuery({
      status: "success",
      data: undefined,
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByText(/No messages available for this commons/i),
    ).toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("handles user commons hook returning invalid data", async () => {
    setupCommonMocks();
    const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");
    useBackendSpy.mockReturnValue({ data: { invalid: true } });
    const useInfiniteQuerySpy = mockInfiniteQuery({
      status: "success",
      data: { pages: [{ content: chatMessageFixtures.oneChatMessage }] },
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        screen.getByTestId("ChatMessageDisplay-1-User"),
      ).toBeInTheDocument(),
    );
    expect(screen.getByTestId("ChatMessageDisplay-1-User")).toHaveTextContent(
      "Anonymous",
    );

    useInfiniteQuerySpy.mockRestore();
    useBackendSpy.mockRestore();
  });

  test("renders no chat messages when a page omits the content array", async () => {
    setupCommonMocks();
    const useInfiniteQuerySpy = mockInfiniteQuery({
      status: "success",
      data: { pages: [{}] },
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.queryAllByTestId(/ChatMessageDisplay-/)).toHaveLength(0);
    expect(
      screen.getByText(/No messages available for this commons/i),
    ).toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("ignores null pages returned from the server", async () => {
    setupCommonMocks();
    const useInfiniteQuerySpy = mockInfiniteQuery({
      status: "success",
      data: { pages: [null] },
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByText(/No messages available for this commons/i),
    ).toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("configures chat history query with commons id and pagination logic", async () => {
    setupCommonMocks();
    const useInfiniteQuerySpy = vi.spyOn(reactQuery, "useInfiniteQuery");
    useInfiniteQuerySpy.mockReturnValue({
      data: { pages: [] },
      status: "success",
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(useInfiniteQuerySpy).toHaveBeenCalled();
    const [queryKey, queryFn, options] = useInfiniteQuerySpy.mock.calls[0];
    expect(queryKey).toEqual(["chatHistory", 1]);
    expect(typeof queryFn).toBe("function");
    expect(options.enabled).toBe(true);
    expect(options.refetchInterval).toBe(2000);

    const samplePages = [{}, {}];
    expect(options.getNextPageParam({ last: false }, samplePages)).toBe(
      samplePages.length,
    );
    expect(
      options.getNextPageParam({ last: true }, samplePages),
    ).toBeUndefined();
    expect(options.getNextPageParam(undefined, samplePages)).toBeUndefined();

    useInfiniteQuerySpy.mockRestore();
  });

  test("status indicator shows when additional pages are available", async () => {
    setupCommonMocks();
    const useInfiniteQuerySpy = mockInfiniteQuery({
      hasNextPage: true,
      data: {
        pages: [
          {
            content: chatMessageFixtures.threeChatMessages,
          },
        ],
      },
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByText(/Scroll to load more messages/i),
    ).toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("does not register an observer when there are no additional pages", async () => {
    setupCommonMocks();
    const useInfiniteQuerySpy = mockInfiniteQuery({
      hasNextPage: false,
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(globalThis.IntersectionObserver).not.toHaveBeenCalled();
    useInfiniteQuerySpy.mockRestore();
  });

  test("status indicator shows loading text while fetching next page", async () => {
    setupCommonMocks();
    const useInfiniteQuerySpy = mockInfiniteQuery({
      hasNextPage: true,
      isFetchingNextPage: true,
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Loading more messages/i)).toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("does not fetch next page when observer entry is not intersecting", async () => {
    setupCommonMocks();
    const fetchNextPage = vi.fn();
    const useInfiniteQuerySpy = mockInfiniteQuery({
      hasNextPage: true,
      fetchNextPage,
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(globalThis.IntersectionObserver).toHaveBeenCalled(),
    );
    intersectionCallback?.([{ isIntersecting: false }]);
    expect(fetchNextPage).not.toHaveBeenCalled();

    useInfiniteQuerySpy.mockRestore();
  });

  test("does not fetch next page while a fetch is already in progress", async () => {
    setupCommonMocks();
    const fetchNextPage = vi.fn();
    const useInfiniteQuerySpy = mockInfiniteQuery({
      hasNextPage: true,
      isFetchingNextPage: true,
      fetchNextPage,
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(globalThis.IntersectionObserver).toHaveBeenCalled(),
    );
    intersectionCallback?.([{ isIntersecting: true }]);
    expect(fetchNextPage).not.toHaveBeenCalled();

    useInfiniteQuerySpy.mockRestore();
  });

  test("shows updating indicator when refreshing current messages", async () => {
    setupCommonMocks();
    const useInfiniteQuerySpy = mockInfiniteQuery({
      isFetching: true,
      isFetchingNextPage: false,
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Updating conversation/i)).toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("does not show updating indicator when not fetching", async () => {
    setupCommonMocks();
    const useInfiniteQuerySpy = mockInfiniteQuery({
      isFetching: false,
      isFetchingNextPage: false,
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.queryByText(/Updating conversation/i),
    ).not.toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("wires up intersection observer to load additional pages", async () => {
    setupCommonMocks();
    axiosMock
      .onGet("/api/chat/get", { params: { commonsId: 1, page: 0, size: 25 } })
      .reply(200, {
        content: chatMessageFixtures.threeChatMessages,
        last: false,
      });
    axiosMock
      .onGet("/api/chat/get", { params: { commonsId: 1, page: 1, size: 25 } })
      .reply(200, {
        content: [],
        last: true,
      });

    const queryClient = new QueryClient();

    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(observe).toHaveBeenCalled());
    expect(globalThis.IntersectionObserver).toHaveBeenCalled();
    const [, observerOptions] = globalThis.IntersectionObserver.mock.calls[0];
    expect(observerOptions).toEqual({ threshold: 1.0 });
    expect(intersectionCallback).toBeInstanceOf(Function);

    intersectionCallback?.([{ isIntersecting: true }]);

    await waitFor(() => {
      const nextPageRequests = axiosMock.history.get.filter(
        (req) =>
          req.url === "/api/chat/get" &&
          req.params?.page === 1 &&
          req.params.size === 25,
      );
      expect(nextPageRequests.length).toBeGreaterThan(0);
    });

    unmount();
    expect(unobserve).toHaveBeenCalled();
  });
});
