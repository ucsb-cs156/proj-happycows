import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminEditAnnouncementsPage from "main/pages/AdminEditAnnouncementsPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { vi } from "vitest";

const mockedNavigate = vi.fn();
const mockToast = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useParams: () => ({
    commonsId: 1,
    announcementId: 2,
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

describe("AdminEditAnnouncementsPage tests", () => {
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

    axiosMock
      .onGet("/api/announcements/getbyid", { params: { id: 2 } })
      .reply(200, {
        id: 2,
        commonsId: 1,
        startDate: "2026-05-21T21:17:00.000-07:00",
        endDate: "2026-05-22T21:17:00.000-07:00",
        announcementText: "old announcement",
      });
  });

  test("renders page and populates form", async () => {
    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <AdminEditAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Edit Announcement")).toBeInTheDocument();
    expect(await screen.findByTestId("AnnouncementForm-id")).toHaveValue("2");
    expect(screen.getByTestId("AnnouncementForm-startDate")).toHaveValue(
      "2026-05-21T21:17",
    );
    expect(screen.getByTestId("AnnouncementForm-endDate")).toHaveValue(
      "2026-05-22T21:17",
    );
    expect(screen.getByTestId("AnnouncementForm-announcementText")).toHaveValue(
      "old announcement",
    );
  });

  test("submits edit announcement with start and end dates", async () => {
    axiosMock.onPut("/api/announcements/put").reply(200, {
      id: 2,
      commonsId: 1,
      startDate: "2026-05-21T21:17:00.000-07:00",
      endDate: "2026-05-22T21:17:00.000-07:00",
      announcementText: "updated announcement",
    });

    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <AdminEditAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const announcementText = await screen.findByTestId(
      "AnnouncementForm-announcementText",
    );

    fireEvent.change(announcementText, {
      target: { value: "updated announcement" },
    });

    fireEvent.click(screen.getByTestId("AnnouncementForm-submit"));

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));

    expect(axiosMock.history.put[0].url).toBe("/api/announcements/put");
    expect(axiosMock.history.put[0].params.id).toBe(2);
    expect(axiosMock.history.put[0].params.commonsId).toBe(1);
    expect(axiosMock.history.put[0].params.announcementText).toBe(
      "updated announcement",
    );
    expect(axiosMock.history.put[0].params.startDate).toContain("2026");
    expect(axiosMock.history.put[0].params.endDate).toContain("2026");

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/admin/announcements/1"),
    );
    expect(mockToast).toHaveBeenCalledWith("Announcement updated");
  });

  test("submits edit announcement without end date", async () => {
    axiosMock
      .onGet("/api/announcements/getbyid", { params: { id: 2 } })
      .reply(200, {
        id: 2,
        commonsId: 1,
        startDate: "2026-05-21T21:17:00.000-07:00",
        endDate: "",
        announcementText: "old announcement",
      });

    axiosMock.onPut("/api/announcements/put").reply(200, {
      id: 2,
      commonsId: 1,
      startDate: "2026-05-21T21:17:00.000-07:00",
      announcementText: "updated announcement",
    });

    render(
      <QueryClientProvider client={getQueryClient()}>
        <MemoryRouter>
          <AdminEditAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("AnnouncementForm-announcementText");

    fireEvent.click(screen.getByTestId("AnnouncementForm-submit"));

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));

    expect(axiosMock.history.put[0].params).not.toHaveProperty("endDate");
    expect(mockToast).toHaveBeenCalledWith("Announcement updated");
  });
});
