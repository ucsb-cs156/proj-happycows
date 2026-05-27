import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
const mockToast = vi.fn();

vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  const toast = (x) => mockToast(x);
  toast.error = (x) => mockToast(x);
  return {
    __esModule: true,
    ...originalModule,
    toast,
  };
});

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
  const testId = "AnnouncementTable";
  const [firstAnnouncement] = announcementFixtures.threeAnnouncements;

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockToast.mockClear();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/commons/plus").reply(200, {
      commons: {
        id: 1,
        name: "Sample Commons",
      },
      totalPlayers: 5,
      totalCows: 5,
    });
    axiosMock.onGet("/api/announcements/getbycommonsid").reply(200, {
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

  test("renders announcements table with data from the API", async () => {
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
      await screen.findByText(firstAnnouncement.announcementText),
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

  test("renders empty table when backend returns no announcements", async () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/commons/plus").reply(200, {
      commons: {
        id: 1,
        name: "Sample Commons",
      },
      totalPlayers: 5,
      totalCows: 5,
    });
    axiosMock.onGet("/api/announcements/getbycommonsid").reply(200, {
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
      await screen.findByText("Announcements for Commons: Sample Commons"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });

  test("admin can delete an announcement", async () => {
    axiosMock
      .onDelete("/api/announcements/delete", { params: { id: 1 } })
      .reply(200, firstAnnouncement);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`),
    );

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(firstAnnouncement),
    );
  });
});
