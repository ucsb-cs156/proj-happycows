import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { vi, describe, test, beforeEach, beforeAll, expect } from "vitest";
import * as reactQuery from "react-query";
import * as backend from "main/utils/useBackend";
import ChatHistoryPage from "main/pages/ChatHistoryPage";

vi.mock("main/layouts/BasicLayout/BasicLayout", () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

vi.mock("main/components/Chat/ChatMessageCreate", () => ({
  __esModule: true,
  default: () => <div data-testid="ChatMessageCreate" />,
}));

vi.mock("main/components/Chat/ChatMessageDisplay", () => ({
  __esModule: true,
  default: ({ message }) => (
    <div data-testid={`ChatMessageDisplay-${message.id}`}>
      <span data-testid={`ChatMessageDisplay-${message.id}-User`}>
        {message.username || "Anonymous"}
      </span>
    </div>
  ),
}));

const mockUseParams = vi.fn(() => ({ commonsId: 1 }));
const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    __esModule: true,
    ...actual,
    useParams: () => mockUseParams(),
    useNavigate: () => mockNavigate,
  };
});

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

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        refetchOnWindowFocus: false,
      },
    },
  });

const renderWithProviders = (ui = <ChatHistoryPage />) => {
  const queryClient = makeQueryClient();
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
  return render(ui, { wrapper: Wrapper });
};

describe("ChatHistoryPage", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const mockInfiniteQuery = (overrides = {}) => {
    const spy = vi.spyOn(reactQuery, "useInfiniteQuery");
    spy.mockReturnValue({
      data: { pages: [{ content: [] }] },
      status: "success",
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
      ...overrides,
    });
    return spy;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();

    mockUseParams.mockImplementation(() => ({ commonsId: 1 }));

    vi.spyOn(backend, "useBackend").mockReturnValue({
      data: [
        { userId: 5, username: "Alice" },
        { userId: 7, username: "Bob" },
      ],
    });

    vi.spyOn(backend, "useBackendMutation").mockReturnValue({
      mutate: vi.fn(),
    });

    intersectionCallback = null;
  });

  test("configures user commons query with expected polling options when commonsId present", () => {
    const useBackendSpy = vi.spyOn(backend, "useBackend");
    const useInfiniteQuerySpy = mockInfiniteQuery();

    renderWithProviders(<ChatHistoryPage />);

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
  });

  test("clicking Back navigates to previous page", async () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      data: { pages: [{ content: [] }] },
      hasNextPage: false,
    });

    renderWithProviders(<ChatHistoryPage />);

    fireEvent.click(screen.getByTestId("ChatHistoryPage-back"));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(-1));
    expect(mockNavigate).toHaveBeenCalledTimes(1);

    useInfiniteQuerySpy.mockRestore();
  });

  test("shows loading indicator while initial messages fetch", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      status: "loading",
      data: undefined,
    });

    renderWithProviders(<ChatHistoryPage />);

    expect(screen.getByText(/Loading messages.../i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Unable to load chat messages/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/No messages available/i),
    ).not.toBeInTheDocument();

    useInfiniteQuerySpy.mockRestore();
  });

  test("shows error message when chat query fails", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      status: "error",
      data: undefined,
    });

    renderWithProviders(<ChatHistoryPage />);

    expect(
      screen.getByText(/Unable to load chat messages/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Loading messages.../i)).not.toBeInTheDocument();

    useInfiniteQuerySpy.mockRestore();
  });

  test("shows empty state when there are no messages after loading (including undefined data)", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      status: "success",
      data: undefined,
    });

    renderWithProviders(<ChatHistoryPage />);

    expect(
      screen.getByText(/No messages available for this commons/i),
    ).toBeInTheDocument();

    useInfiniteQuerySpy.mockRestore();
  });

  test("renders create form when not readOnly; hides it when readOnly and shows banner", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      data: { pages: [{ content: [] }] },
    });

    const { rerender } = renderWithProviders(
      <ChatHistoryPage readOnly={false} />,
    );

    expect(screen.getByTestId("ChatMessageCreate")).toBeInTheDocument();
    expect(screen.queryByText(/Admin Read Only/i)).not.toBeInTheDocument();

    rerender(<ChatHistoryPage readOnly={true} />);

    expect(screen.getByText(/Admin Read Only/i)).toBeInTheDocument();
    expect(screen.queryByTestId("ChatMessageCreate")).not.toBeInTheDocument();

    useInfiniteQuerySpy.mockRestore();
  });

  test("renders messages, maps usernames, and applies hidden styling", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      status: "success",
      data: {
        pages: [
          {
            content: [
              { id: 10, userId: 5, hidden: false },
              { id: 11, userId: 7, hidden: true },
            ],
            last: true,
          },
        ],
      },
      hasNextPage: false,
    });

    renderWithProviders(<ChatHistoryPage />);

    expect(screen.getByTestId("ChatMessageDisplay-10-User")).toHaveTextContent(
      "Alice",
    );
    expect(screen.getByTestId("ChatMessageDisplay-11-User")).toHaveTextContent(
      "Bob",
    );

    const hiddenWrapper = screen.getByTestId(
      "ChatMessageDisplay-11",
    ).parentElement;
    expect(hiddenWrapper).toHaveStyle("opacity: 0.5");
    expect(hiddenWrapper).toHaveStyle("font-style: italic");

    const visibleWrapper = screen.getByTestId(
      "ChatMessageDisplay-10",
    ).parentElement;
    expect(visibleWrapper).not.toHaveStyle("opacity: 0.5");
    expect(visibleWrapper).not.toHaveStyle("font-style: italic");

    expect(screen.getByText("[no more messages]")).toBeInTheDocument();

    useInfiniteQuerySpy.mockRestore();
  });

  test("falls back to Anonymous when user commons hook returns invalid data", () => {
    vi.spyOn(backend, "useBackend").mockReturnValue({
      data: { invalid: true },
    });

    const useInfiniteQuerySpy = mockInfiniteQuery({
      data: {
        pages: [{ content: [{ id: 21, userId: 999, hidden: false }] }],
      },
    });

    renderWithProviders(<ChatHistoryPage />);

    expect(screen.getByTestId("ChatMessageDisplay-21-User")).toHaveTextContent(
      "Anonymous",
    );

    useInfiniteQuerySpy.mockRestore();
  });

  test("does not render messages when a page is null or content missing/not array", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      data: { pages: [null, {}, { content: "nope" }] },
    });

    renderWithProviders(<ChatHistoryPage />);

    expect(screen.queryAllByTestId(/ChatMessageDisplay-/)).toHaveLength(0);
    expect(
      screen.getByText(/No messages available for this commons/i),
    ).toBeInTheDocument();

    useInfiniteQuerySpy.mockRestore();
  });

  test("shows updating indicator when refreshing current messages (isFetching true, not isFetchingNextPage)", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      isFetching: true,
      isFetchingNextPage: false,
    });

    renderWithProviders(<ChatHistoryPage />);

    expect(screen.getByText(/Updating conversation.../i)).toBeInTheDocument();

    useInfiniteQuerySpy.mockRestore();
  });

  test("does NOT show updating indicator while fetching next page", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      isFetching: true,
      isFetchingNextPage: true,
    });

    renderWithProviders(<ChatHistoryPage />);

    expect(
      screen.queryByText(/Updating conversation.../i),
    ).not.toBeInTheDocument();

    useInfiniteQuerySpy.mockRestore();
  });

  test("status indicator prioritizes fetching-next-page text over hasNextPage text", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      hasNextPage: true,
      isFetchingNextPage: true,
    });

    renderWithProviders(<ChatHistoryPage />);

    expect(screen.getByText(/Loading more messages.../i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Scroll to load more messages/i),
    ).not.toBeInTheDocument();

    useInfiniteQuerySpy.mockRestore();
  });

  test("status indicator shows 'Scroll to load more messages' when hasNextPage true and not fetching next page", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      hasNextPage: true,
      isFetchingNextPage: false,
    });

    renderWithProviders(<ChatHistoryPage />);

    expect(
      screen.getByText(/Scroll to load more messages/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Loading more messages.../i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("[no more messages]")).not.toBeInTheDocument();

    useInfiniteQuerySpy.mockRestore();
  });

  test("admin mode renders Delete button and confirms before mutating (confirm=true)", () => {
    const mutate = vi.fn();
    vi.spyOn(backend, "useBackendMutation").mockReturnValue({ mutate });

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    const useInfiniteQuerySpy = mockInfiniteQuery({
      data: { pages: [{ content: [{ id: 33, userId: 5, hidden: false }] }] },
    });

    renderWithProviders(<ChatHistoryPage isAdmin={true} />);

    fireEvent.click(screen.getByTestId("ChatHistoryPage-delete-33"));

    expect(confirmSpy).toHaveBeenCalledWith("Delete this message?");
    expect(mutate).toHaveBeenCalledWith(33);
    expect(mutate).toHaveBeenCalledTimes(1);

    useInfiniteQuerySpy.mockRestore();
  });

  test("admin mode does not mutate when confirm=false", () => {
    const mutate = vi.fn();
    vi.spyOn(backend, "useBackendMutation").mockReturnValue({ mutate });

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    const useInfiniteQuerySpy = mockInfiniteQuery({
      data: { pages: [{ content: [{ id: 34, userId: 5, hidden: false }] }] },
    });

    renderWithProviders(<ChatHistoryPage isAdmin={true} />);

    fireEvent.click(screen.getByTestId("ChatHistoryPage-delete-34"));

    expect(confirmSpy).toHaveBeenCalledWith("Delete this message?");
    expect(mutate).not.toHaveBeenCalled();

    useInfiniteQuerySpy.mockRestore();
  });

  test("non-admin mode does not render Delete button", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      data: { pages: [{ content: [{ id: 40, userId: 5, hidden: false }] }] },
    });

    renderWithProviders(<ChatHistoryPage isAdmin={false} />);

    expect(
      screen.queryByTestId("ChatHistoryPage-delete-40"),
    ).not.toBeInTheDocument();

    useInfiniteQuerySpy.mockRestore();
  });

  test("observer is registered only when hasNextPage is true; cleanup calls unobserve", async () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({ hasNextPage: true });

    const { unmount } = renderWithProviders(<ChatHistoryPage />);

    await waitFor(() =>
      expect(globalThis.IntersectionObserver).toHaveBeenCalled(),
    );
    expect(observe).toHaveBeenCalledTimes(1);

    unmount();
    expect(unobserve).toHaveBeenCalledTimes(1);

    useInfiniteQuerySpy.mockRestore();
  });

  test("does not register an observer when there are no additional pages", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({ hasNextPage: false });

    renderWithProviders(<ChatHistoryPage />);

    expect(globalThis.IntersectionObserver).not.toHaveBeenCalled();

    useInfiniteQuerySpy.mockRestore();
  });

  test("fetchNextPage is called only when intersecting, hasNextPage true, and not already fetching next page", async () => {
    const fetchNextPage = vi.fn();
    const useInfiniteQuerySpy = mockInfiniteQuery({
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage,
    });

    renderWithProviders(<ChatHistoryPage />);

    await waitFor(() =>
      expect(globalThis.IntersectionObserver).toHaveBeenCalled(),
    );

    intersectionCallback?.([{ isIntersecting: false }]);
    expect(fetchNextPage).not.toHaveBeenCalled();

    intersectionCallback?.([{ isIntersecting: true }]);
    expect(fetchNextPage).toHaveBeenCalledTimes(1);

    useInfiniteQuerySpy.mockRestore();
  });

  test("does NOT call fetchNextPage when intersecting but already fetching next page", async () => {
    const fetchNextPage = vi.fn();
    const useInfiniteQuerySpy = mockInfiniteQuery({
      hasNextPage: true,
      isFetchingNextPage: true,
      fetchNextPage,
    });

    renderWithProviders(<ChatHistoryPage />);

    await waitFor(() =>
      expect(globalThis.IntersectionObserver).toHaveBeenCalled(),
    );

    intersectionCallback?.([{ isIntersecting: true }]);
    expect(fetchNextPage).not.toHaveBeenCalled();

    useInfiniteQuerySpy.mockRestore();
  });

  test("captures queryFn + queryKey: uses ['chatHistory', commonsId] and correct admin/non-admin URLs", async () => {
    // non-admin
    const spy1 = vi.spyOn(reactQuery, "useInfiniteQuery");
    spy1.mockReturnValue({
      data: { pages: [{ content: [] }] },
      status: "success",
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
    });

    renderWithProviders(<ChatHistoryPage isAdmin={false} />);

    const [keyNonAdmin, queryFnNonAdmin] = spy1.mock.calls[0];

    expect(keyNonAdmin).toEqual(["chatHistory", 1]);

    axiosMock
      .onGet("/api/chat/get", { params: { commonsId: 1, page: 2, size: 25 } })
      .reply(200, { content: [], last: true });

    await queryFnNonAdmin({ pageParam: 2 });

    expect(
      axiosMock.history.get.some(
        (r) =>
          r.url === "/api/chat/get" &&
          r.params?.page === 2 &&
          r.params?.size === 25,
      ),
    ).toBe(true);

    spy1.mockRestore();
    axiosMock.resetHistory();

    const spy2 = vi.spyOn(reactQuery, "useInfiniteQuery");
    spy2.mockReturnValue({
      data: { pages: [{ content: [] }] },
      status: "success",
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
    });

    renderWithProviders(<ChatHistoryPage isAdmin={true} />);

    const [keyAdmin, queryFnAdmin] = spy2.mock.calls[0];
    expect(keyAdmin).toEqual(["chatHistory", 1]);

    axiosMock
      .onGet("/api/chat/admin/get", {
        params: { commonsId: 1, page: 0, size: 25 },
      })
      .reply(200, { content: [], last: true });

    await queryFnAdmin({ pageParam: 0 });

    expect(
      axiosMock.history.get.some(
        (r) =>
          r.url === "/api/chat/admin/get" &&
          r.params?.page === 0 &&
          r.params?.size === 25,
      ),
    ).toBe(true);

    spy2.mockRestore();
  });

  test("getNextPageParam returns pages.length only when last === false", () => {
    const useInfiniteQuerySpy = vi.spyOn(reactQuery, "useInfiniteQuery");
    useInfiniteQuerySpy.mockReturnValue({
      data: { pages: [{ content: [] }] },
      status: "success",
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
    });

    renderWithProviders(<ChatHistoryPage />);

    const [, , options] = useInfiniteQuerySpy.mock.calls[0];
    const pages = [{}, {}];

    expect(options.getNextPageParam({ last: false }, pages)).toBe(pages.length);
    expect(options.getNextPageParam({ last: true }, pages)).toBeUndefined();
    expect(options.getNextPageParam(undefined, pages)).toBeUndefined();

    useInfiniteQuerySpy.mockRestore();
  });

  test("disables queries when commonsId is missing", () => {
    mockUseParams.mockImplementation(() => ({ commonsId: undefined }));

    const useBackendSpy = vi
      .spyOn(backend, "useBackend")
      .mockReturnValue({ data: [] });

    const useInfiniteQuerySpy = vi.spyOn(reactQuery, "useInfiniteQuery");
    useInfiniteQuerySpy.mockReturnValue({
      data: { pages: [{ content: [] }] },
      status: "success",
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
    });

    renderWithProviders(<ChatHistoryPage />);

    const backendCall = useBackendSpy.mock.calls[0];
    expect(backendCall[3]).toEqual({ refetchInterval: 2000, enabled: false });

    const infiniteOptions = useInfiniteQuerySpy.mock.calls[0][2];
    expect(infiniteOptions.enabled).toBe(false);

    useInfiniteQuerySpy.mockRestore();
  });

  test("maps userId to username using reduce when userCommonsList is valid array", () => {
    vi.spyOn(backend, "useBackend").mockReturnValue({
      data: [
        { userId: 1, username: "Alice" },
        { userId: 2, username: "Bob" },
        { userId: 3, username: null },
      ],
    });

    const useInfiniteQuerySpy = mockInfiniteQuery({
      data: {
        pages: [
          {
            content: [
              { id: 1, userId: 1 },
              { id: 2, userId: 2 },
              { id: 3, userId: 3 },
            ],
          },
        ],
      },
    });

    renderWithProviders(<ChatHistoryPage />);

    expect(screen.getByTestId("ChatMessageDisplay-1-User")).toHaveTextContent(
      "Alice",
    );
    expect(screen.getByTestId("ChatMessageDisplay-2-User")).toHaveTextContent(
      "Bob",
    );
    expect(screen.getByTestId("ChatMessageDisplay-3-User")).toHaveTextContent(
      "Anonymous",
    );

    useInfiniteQuerySpy.mockRestore();
  });

  test("delete mutation is configured with correct API request and invalidate key", () => {
    const mutationSpy = vi.spyOn(backend, "useBackendMutation");
    const useInfiniteQuerySpy = mockInfiniteQuery({
      data: { pages: [{ content: [] }] },
    });

    renderWithProviders(<ChatHistoryPage isAdmin={true} />);

    expect(mutationSpy).toHaveBeenCalled();

    // invalidate/refetch key must match EXACTLY (kills key mutants)
    expect(mutationSpy.mock.calls[0][2]).toEqual([
      "/api/chat/admin/get?commonsId=1",
    ]);

    const mutationFn = mutationSpy.mock.calls[0][0];
    const result = mutationFn(123);

    expect(result).toEqual({
      url: "/api/chat/hide",
      method: "PUT",
      params: { chatMessageId: 123 },
    });

    useInfiniteQuerySpy.mockRestore();
  });

  test("deleteMutation onSuccess is defined", () => {
    const mutationSpy = vi.spyOn(backend, "useBackendMutation");
    mockInfiniteQuery();

    renderWithProviders(<ChatHistoryPage isAdmin={true} />);

    const options = mutationSpy.mock.calls[0][1];
    expect(options).toHaveProperty("onSuccess");
    expect(typeof options.onSuccess).toBe("function");
  });

  test("deleteMutation onSuccess callback executes", () => {
    const mutationSpy = vi.spyOn(backend, "useBackendMutation");
    mockInfiniteQuery({ data: { pages: [{ content: [] }] } });

    renderWithProviders(<ChatHistoryPage isAdmin={true} />);

    const options = mutationSpy.mock.calls[0][1];
    expect(options).toHaveProperty("onSuccess");
    expect(typeof options.onSuccess).toBe("function");

    options.onSuccess();
  });

  test("scroll container has white background styling", () => {
    const useInfiniteQuerySpy = mockInfiniteQuery({
      data: {
        pages: [
          {
            content: [{ id: 99, userId: 5, hidden: false }],
            last: true,
          },
        ],
      },
      hasNextPage: false,
    });

    renderWithProviders(<ChatHistoryPage />);

    const container = document.querySelector('div[style*="overflow-y: auto"]');
    expect(container).toBeTruthy();
    expect(container).toHaveStyle("background-color: white");

    useInfiniteQuerySpy.mockRestore();
  });

  test("defaults to non-readOnly and non-admin", () => {
    mockInfiniteQuery();

    renderWithProviders();

    expect(screen.getByTestId("ChatMessageCreate")).toBeInTheDocument();

    expect(screen.queryByText(/Admin Read Only/i)).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(/ChatHistoryPage-delete-/),
    ).not.toBeInTheDocument();
  });

  test("observer is created with threshold 1.0", async () => {
    mockInfiniteQuery({ hasNextPage: true });

    renderWithProviders();

    await waitFor(() =>
      expect(globalThis.IntersectionObserver).toHaveBeenCalled(),
    );

    const options = globalThis.IntersectionObserver.mock.calls[0][1];
    expect(options).toEqual({ threshold: 1.0 });
  });

  test("observer reacts to dependency changes", async () => {
    const fetchNextPage = vi.fn();

    const spy = mockInfiniteQuery({
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage,
    });

    const { rerender } = renderWithProviders();

    await waitFor(() =>
      expect(globalThis.IntersectionObserver).toHaveBeenCalled(),
    );

    intersectionCallback?.([{ isIntersecting: true }]);
    expect(fetchNextPage).toHaveBeenCalledTimes(1);

    spy.mockReturnValue({
      ...spy.mock.results[0].value,
      isFetchingNextPage: true,
    });

    rerender(<ChatHistoryPage />);

    intersectionCallback?.([{ isIntersecting: true }]);

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  test("scroll container has correct layout styling", () => {
    mockInfiniteQuery();

    renderWithProviders();

    const container = screen.getByTestId("ChatHistoryPage-message-container");

    expect(container).toHaveStyle("min-height: 50vh");
    expect(container).toHaveStyle("max-height: 70vh");
    expect(container).toHaveStyle("border: 1px solid #dee2e6");
    expect(container).toHaveStyle("border-radius: 0.5rem");
    expect(container).toHaveStyle("padding: 1rem");
  });

  test("does NOT show empty state when messages exist", () => {
    mockInfiniteQuery({
      status: "success",
      data: {
        pages: [
          {
            content: [{ id: 1, userId: 5, hidden: false }],
          },
        ],
      },
    });

    renderWithProviders();

    expect(
      screen.queryByText(/No messages available for this commons/i),
    ).not.toBeInTheDocument();
  });

  test("default (non-admin) view never shows delete buttons", () => {
    mockInfiniteQuery({
      data: {
        pages: [
          {
            content: [
              { id: 1, userId: 5, hidden: false },
              { id: 2, userId: 7, hidden: false },
            ],
          },
        ],
      },
    });

    renderWithProviders(<ChatHistoryPage />);

    expect(screen.queryAllByTestId(/ChatHistoryPage-delete-/)).toHaveLength(0);
  });
});
