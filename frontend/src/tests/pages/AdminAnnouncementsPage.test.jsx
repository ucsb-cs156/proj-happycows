import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminAnnouncementsPage from "main/pages/AdminAnnouncementsPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { vi } from "vitest";

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useParams: () => ({
    commonsId: 1,
  }),
}));

describe("AdminAnnouncementsPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const getQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    axiosMock.onGet("/api/commons/plus", { params: { id: 1 } }).reply(200, {
      commons: {
        id: 1,
        name: "Sample Commons",
      },
    });
  });

  test("renders page without crashing", async () => {
    axiosMock
      .onGet("/api/announcements/getbycommonsid", { params: { commonsId: 1 } })
      .reply(200, { content: [] });

    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <AdminAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Announcements for Commons: Sample Commons"),
    ).toBeInTheDocument();
  });

  test("renders announcements with correct commons name", async () => {
    axiosMock
      .onGet("/api/announcements/getbycommonsid", { params: { commonsId: 1 } })
      .reply(200, {
        content: [
          {
            id: 1,
            commonsId: 1,
            startDate: "2026-05-21T21:17:00.000-07:00",
            endDate: "2026-05-22T21:17:00.000-07:00",
            announcementText: "hello announcement",
          },
        ],
      });

    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <AdminAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Announcements for Commons: Sample Commons"),
    ).toBeInTheDocument();
    expect(await screen.findByText("hello announcement")).toBeInTheDocument();
  });

  test("renders empty table when announcements response has no content", async () => {
    axiosMock
      .onGet("/api/announcements/getbycommonsid", { params: { commonsId: 1 } })
      .reply(200, {});

    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <AdminAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Announcements for Commons: Sample Commons"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Stryker was here")).not.toBeInTheDocument();
  });
});
