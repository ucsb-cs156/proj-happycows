import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { vi } from "vitest";
import * as reactQuery from "react-query";
import * as useBackendModule from "main/utils/useBackend";

import AdminChatPage from "main/pages/AdminChatPage";
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

describe("AdminChatPage", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const setupCommonMocks = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockNavigate.mockClear();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
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

  test("renders without crashing", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery();
    const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");
    useBackendSpy.mockReturnValue({ data: [] });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("AdminChatPage")).toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
    useBackendSpy.mockRestore();
  });

  test("uses admin endpoint /api/chat/admin/get", async () => {
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
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(useInfiniteQuerySpy).toHaveBeenCalled();
    const [queryKey] = useInfiniteQuerySpy.mock.calls[0];
    expect(queryKey).toEqual(["adminChatHistory", 1]);

    useInfiniteQuerySpy.mockRestore();
  });

  test("renders chat messages and shows terminal status when no more pages", async () => {
    setupCommonMocks();
    axiosMock
      .onGet("/api/chat/admin/get", {
        params: { commonsId: 1, page: 0, size: 25 },
      })
      .reply(200, {
        content: chatMessageFixtures.threeChatMessages,
        last: true,
      });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const container = await screen.findByTestId("AdminChatPage-message-container");
    expect(container).toHaveStyle("min-height: 50vh");
    expect(container).toHaveStyle("max-height: 70vh");
    expect(container).toHaveStyle("overflow-y: auto");

    expect(screen.getByTestId("ChatMessageDisplay-1")).toBeInTheDocument();
    expect(screen.getByText("[no more messages]")).toBeInTheDocument();
  });

  test("does not show ChatMessageCreate (read-only view)", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery();
    const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");
    useBackendSpy.mockReturnValue({ data: [] });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.queryByTestId("ChatMessageCreate")).not.toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
    useBackendSpy.mockRestore();
  });

  test("shows heading with commons id", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery();
    const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");
    useBackendSpy.mockReturnValue({ data: [] });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByText("Chat History (Admin View)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Commons #1")).toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
    useBackendSpy.mockRestore();
  });

  test("clicking back navigates to previous page", async () => {
    setupCommonMocks();
    axiosMock
      .onGet("/api/chat/admin/get", {
        params: { commonsId: 1, page: 0, size: 25 },
      })
      .reply(200, { content: [], last: true });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const backButton = await screen.findByTestId("AdminChatPage-back");
    fireEvent.click(backButton);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(-1));
  });

  test("shows loading indicator while initial messages fetch", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({ status: "loading" });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Loading messages.../i)).toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("shows error message when chat query fails", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({ status: "error" });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByText(/Unable to load chat messages/i),
    ).toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("shows empty state when there are no messages after loading", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      status: "success",
      data: { pages: [{ content: [] }] },
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByText(/No messages available for this commons/i),
    ).toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("shows updating indicator when refreshing current messages", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      isFetching: true,
      isFetchingNextPage: false,
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Updating conversation/i)).toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("status indicator shows loading text while fetching next page", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      hasNextPage: true,
      isFetchingNextPage: true,
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Loading more messages/i)).toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("status indicator shows scroll prompt when more pages available", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      hasNextPage: true,
      isFetchingNextPage: false,
      data: { pages: [{ content: chatMessageFixtures.threeChatMessages }] },
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByText(/Scroll to load more messages/i),
    ).toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("configures user commons query with expected polling options", () => {
    const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");
    useBackendSpy.mockReturnValue({ data: [] });
    const useInfiniteQuerySpy = mockInfiniteQuery();

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(useBackendSpy).toHaveBeenCalledWith(
      [`/api/usercommons/commons/all?commonsId=1`],
      {
        method: "GET",
        url: "/api/usercommons/commons/all",
        params: { commonsId: 1 },
      },
      [],
      { refetchInterval: 2000, enabled: true },
    );

    useInfiniteQuerySpy.mockRestore();
    useBackendSpy.mockRestore();
  });

  test("configures chat query key, pagination logic, and polling options", () => {
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
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(useInfiniteQuerySpy).toHaveBeenCalled();
    const [queryKey, queryFn, options] = useInfiniteQuerySpy.mock.calls[0];
    expect(queryKey).toEqual(["adminChatHistory", 1]);
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

  test("fetchChatPage calls /api/chat/admin/get with correct params", async () => {
    setupCommonMocks();
    axiosMock
      .onGet("/api/chat/admin/get", {
        params: { commonsId: 1, page: 0, size: 25 },
      })
      .reply(200, { content: [], last: true });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      const adminGetRequests = axiosMock.history.get.filter(
        (req) =>
          req.url === "/api/chat/admin/get" &&
          req.params?.commonsId === 1 &&
          req.params?.page === 0 &&
          req.params?.size === 25,
      );
      expect(adminGetRequests.length).toBeGreaterThan(0);
    });
  });

  test("falls back to anonymous usernames when user commons are missing data", async () => {
    setupCommonMocks();
    axiosMock
      .onGet("/api/usercommons/commons/all", { params: { commonsId: 1 } })
      .reply(200, [{ userId: 1 }]);
    axiosMock
      .onGet("/api/chat/admin/get", {
        params: { commonsId: 1, page: 0, size: 25 },
      })
      .reply(200, {
        content: chatMessageFixtures.oneChatMessage,
        last: true,
      });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
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
          <AdminChatPage />
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

  test("renders no chat messages when a page omits the content array", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      status: "success",
      data: { pages: [{}] },
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.queryAllByTestId(/ChatMessageDisplay-/)).toHaveLength(0);
    expect(
      screen.getByText(/No messages available for this commons/i),
    ).toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("ignores null pages returned from the server", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      status: "success",
      data: { pages: [null] },
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByText(/No messages available for this commons/i),
    ).toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("renders empty state when query data is undefined", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      status: "success",
      data: undefined,
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByText(/No messages available for this commons/i),
    ).toBeInTheDocument();
    useInfiniteQuerySpy.mockRestore();
  });

  test("does not register an observer when there are no additional pages", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({ hasNextPage: false });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(globalThis.IntersectionObserver).not.toHaveBeenCalled();
    useInfiniteQuerySpy.mockRestore();
  });

  test("does not fetch next page when observer entry is not intersecting", async () => {
    const fetchNextPage = vi.fn();
    const useInfiniteQuerySpy = mockInfiniteQuery({
      hasNextPage: true,
      fetchNextPage,
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
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
          <AdminChatPage />
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

  test("does not show updating indicator when not fetching", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      isFetching: false,
      isFetchingNextPage: false,
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
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
      .onGet("/api/chat/admin/get", {
        params: { commonsId: 1, page: 0, size: 25 },
      })
      .reply(200, {
        content: chatMessageFixtures.threeChatMessages,
        last: false,
      });
    axiosMock
      .onGet("/api/chat/admin/get", {
        params: { commonsId: 1, page: 1, size: 25 },
      })
      .reply(200, { content: [], last: true });

    const queryClient = new QueryClient();

    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminChatPage />
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
          req.url === "/api/chat/admin/get" &&
          req.params?.page === 1 &&
          req.params.size === 25,
      );
      expect(nextPageRequests.length).toBeGreaterThan(0);
    });

    unmount();
    expect(unobserve).toHaveBeenCalled();
  });
});
