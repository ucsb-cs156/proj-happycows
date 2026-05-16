import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { announcementFixtures } from "fixtures/announcementFixtures";
import AdminAnnouncementsPage from "main/pages/AdminAnnouncementsPage";
import { vi } from "vitest";

const mockedNavigate = vi.fn();
const fallbackAnnouncementText =
  announcementFixtures.threeAnnouncements[1].announcementText;

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useParams: () => ({
    commonsId: 1,
  }),
  useNavigate: () => mockedNavigate,
}));

describe("AdminAnnouncementsPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

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
      totalPlayers: 5,
      totalCows: 5,
    });
    axiosMock
      .onGet("/api/announcements/getbycommonsid", { params: { commonsId: 1 } })
      .reply(200, {
        content: announcementFixtures.threeAnnouncements,
        pageable: {
          pageNumber: 0,
          pageSize: 1000,
        },
        totalElements: 3,
        totalPages: 1,
      });
  });

  test("renders page without crashing", async () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Announcements for Commons: Sample Commons"),
    ).toBeInTheDocument();

    const headerRow = container.querySelector(".row.pt-5.pb-3");
    expect(headerRow).toHaveStyle({ gap: "30px" });
  });

  test("renders announcements table with data", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Announcements for Commons: Sample Commons"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(fallbackAnnouncementText),
    ).toBeInTheDocument();
  });

  test("create announcement button has correct href", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Announcements for Commons: Sample Commons"),
    ).toBeInTheDocument();
    const createButton = screen.getByText("Create Announcement");
    expect(createButton).toHaveAttribute(
      "href",
      "/admin/announcements/1/create",
    );
  });

  test("renders fixture announcements when backend returns empty content", async () => {
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
      totalPlayers: 5,
      totalCows: 5,
    });
    axiosMock
      .onGet("/api/announcements/getbycommonsid", { params: { commonsId: 1 } })
      .reply(200, {
        content: [],
        pageable: {
          pageNumber: 0,
          pageSize: 1000,
        },
        totalElements: 0,
        totalPages: 0,
      });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText(fallbackAnnouncementText),
    ).toBeInTheDocument();
  });
});
