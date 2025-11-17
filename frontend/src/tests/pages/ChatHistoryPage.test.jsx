import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { vi } from "vitest";

import ChatHistoryPage from "main/pages/ChatHistoryPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import userCommonsFixtures from "fixtures/userCommonsFixtures";
import { chatMessageFixtures } from "fixtures/chatMessageFixtures";

const observe = vi.fn();
const unobserve = vi.fn();

beforeAll(() => {
  global.IntersectionObserver = vi.fn(function () {
    this.observe = observe;
    this.unobserve = unobserve;
    this.disconnect = vi.fn();
  });
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

    await waitFor(() =>
      expect(
        screen.getByTestId("ChatHistoryPage-message-container"),
      ).toBeInTheDocument(),
    );

    expect(screen.getByTestId("ChatMessageDisplay-1")).toBeInTheDocument();
    expect(screen.getByText("[no more messages]")).toBeInTheDocument();
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
});
