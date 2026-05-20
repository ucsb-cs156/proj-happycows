import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminCreateAnnouncementsPage from "main/pages/AdminCreateAnnouncementsPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import AdminAnnouncementsPage from "main/pages/AdminAnnouncementsPage";
import { vi } from "vitest";

const mockedNavigate = vi.fn();
const mockToast = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useParams: () => ({
    commonsId: 1,
  }),
  useNavigate: () => mockedNavigate,
}));

vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("AdminCreateAnnouncementsPage tests", () => {
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
    mockedNavigate.mockClear();
    mockToast.mockClear();

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
      .reply(200, { content: [] });
  });

  test("renders page without crashing", async () => {
    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <AdminCreateAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Create Announcement")).toBeInTheDocument();
    expect(
      await screen.findByText("for Commons: Sample Commons"),
    ).toBeInTheDocument();
  });

  test("correct href for create announcements button as an admin", async () => {
    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <AdminAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const createButton = await screen.findByText("Create Announcement");
    expect(createButton).toHaveAttribute(
      "href",
      "/admin/announcements/1/create",
    );
  });

  test("submits create announcement with start and end dates", async () => {
    axiosMock.onPost("/api/announcements/post").reply(200, {
      id: 1,
      commonsId: 1,
      startDate: "2026-05-21T21:17:00.000-07:00",
      endDate: "2026-05-22T21:17:00.000-07:00",
      announcementText: "new announcement",
    });

    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <AdminCreateAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.change(await screen.findByTestId("AnnouncementForm-startDate"), {
      target: { value: "2026-05-21T21:17" },
    });
    fireEvent.change(screen.getByTestId("AnnouncementForm-endDate"), {
      target: { value: "2026-05-22T21:17" },
    });
    fireEvent.change(screen.getByTestId("AnnouncementForm-announcementText"), {
      target: { value: "new announcement" },
    });

    fireEvent.click(screen.getByTestId("AnnouncementForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].url).toBe("/api/announcements/post");
    expect(axiosMock.history.post[0].params.commonsId).toBe(1);
    expect(axiosMock.history.post[0].params.announcementText).toBe(
      "new announcement",
    );
    expect(axiosMock.history.post[0].params.startDate).toContain("2026");
    expect(axiosMock.history.post[0].params.endDate).toContain("2026");

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/admin/announcements/1"),
    );
    expect(mockToast).toHaveBeenCalledWith("Announcement created");
  });

  test("submits create announcement without end date", async () => {
    axiosMock.onPost("/api/announcements/post").reply(200, {
      id: 1,
      commonsId: 1,
      startDate: "2026-05-21T21:17:00.000-07:00",
      announcementText: "new announcement",
    });

    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <AdminCreateAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.change(await screen.findByTestId("AnnouncementForm-startDate"), {
      target: { value: "2026-05-21T21:17" },
    });
    fireEvent.change(screen.getByTestId("AnnouncementForm-announcementText"), {
      target: { value: "new announcement" },
    });

    fireEvent.click(screen.getByTestId("AnnouncementForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).not.toHaveProperty("endDate");
    expect(mockToast).toHaveBeenCalledWith("Announcement created");
  });
});
