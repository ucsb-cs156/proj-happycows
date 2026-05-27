import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { vi } from "vitest";
import AdminEditAnnouncementsPage from "main/pages/AdminEditAnnouncementsPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { announcementFixtures } from "fixtures/announcementFixtures";
import * as useBackendModule from "main/utils/useBackend";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    __esModule: true,
    ...originalModule,
    useParams: () => ({
      commonsId: 1,
      id: 5,
    }),
    Navigate: (x) => {
      mockedNavigate(x);
      return null;
    },
  };
});

const mockToast = vi.fn();
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

  const setupMocks = () => {
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
    axiosMock.onGet("/api/announcements/getbyid", { params: { id: 5 } }).reply(
      200,
      {
        ...announcementFixtures.oneAnnouncement,
        id: 5,
        commonsId: 1,
      },
    );
  };

  test("renders and populates form with announcement data", async () => {
    setupMocks();
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminEditAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Edit Announcement for Commons Sample Commons"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("AnnouncementForm-id")).toHaveValue("5");
    expect(screen.getByTestId("AnnouncementForm-startDate")).toHaveValue(
      "2024-12-12T00:00",
    );
    expect(screen.getByTestId("AnnouncementForm-endDate")).toHaveValue(
      "2025-12-12T00:00",
    );
    expect(screen.getByTestId("AnnouncementForm-announcementText")).toHaveValue(
      announcementFixtures.oneAnnouncement.announcementText,
    );
  });

  test("configures getbyid query to refetch on mount", async () => {
    setupMocks();
    const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminEditAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("AnnouncementForm-id");
    expect(useBackendSpy).toHaveBeenCalledWith(
      [`/api/announcements/getbyid?id=5`],
      {
        method: "GET",
        url: "/api/announcements/getbyid",
        params: {
          id: 5,
        },
      },
      undefined,
      { refetchOnMount: "always" },
    );
    useBackendSpy.mockRestore();
  });

  test("updates announcement with formatted start and end dates", async () => {
    setupMocks();
    const invalidateQueriesSpy = vi.spyOn(
      QueryClient.prototype,
      "invalidateQueries",
    );
    axiosMock.onPut("/api/announcements/put").reply(200, {
      id: 5,
      commonsId: 1,
      announcementText: "Updated announcement",
      startDate: "2004-12-10T00:12:00",
      endDate: "2004-12-10T13:45:00",
    });
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminEditAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("AnnouncementForm-id")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("AnnouncementForm-startDate"), {
      target: { value: "2004-12-10T00:12" },
    });
    fireEvent.change(screen.getByTestId("AnnouncementForm-endDate"), {
      target: { value: "2004-12-10T13:45" },
    });
    fireEvent.change(screen.getByTestId("AnnouncementForm-announcementText"), {
      target: { value: "Updated announcement" },
    });
    fireEvent.click(screen.getByTestId("AnnouncementForm-submit"));

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    expect(axiosMock.history.put[0].params).toEqual({
      id: 5,
      commonsId: 1,
      announcementText: "Updated announcement",
      startDate: "Dec 10, 2004, 12:12:00 AM",
      endDate: "Dec 10, 2004, 1:45:00 PM",
    });
    expect(mockToast).toHaveBeenCalledWith("Announcement updated - id: 5");
    expect(mockedNavigate).toHaveBeenCalledWith({
      to: "/admin/announcements/1",
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith(
      "/api/announcements/getbycommonsid?commonsId=1",
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith(
      "/api/announcements/getbyid?id=5",
    );
    invalidateQueriesSpy.mockRestore();
  });

  test("updates announcement without optional dates", async () => {
    setupMocks();
    axiosMock.onPut("/api/announcements/put").reply(200, {
      id: 5,
      commonsId: 1,
      announcementText: "Updated without dates",
      startDate: "2026-05-27T00:00:00",
      endDate: null,
    });
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminEditAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("AnnouncementForm-id")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("AnnouncementForm-startDate"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByTestId("AnnouncementForm-endDate"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByTestId("AnnouncementForm-announcementText"), {
      target: { value: "Updated without dates" },
    });
    fireEvent.click(screen.getByTestId("AnnouncementForm-submit"));

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    expect(axiosMock.history.put[0].params).toEqual({
      id: 5,
      commonsId: 1,
      announcementText: "Updated without dates",
    });
    expect(mockToast).toHaveBeenCalledWith("Announcement updated - id: 5");
    expect(mockedNavigate).toHaveBeenCalledWith({
      to: "/admin/announcements/1",
    });
  });

  test("objectToAxiosParams omits blank optional dates before axios", async () => {
    setupMocks();
    const useBackendMutationSpy = vi
      .spyOn(useBackendModule, "useBackendMutation")
      .mockReturnValue({ mutate: vi.fn(), isSuccess: false });
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminEditAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("AnnouncementForm-id")).toBeInTheDocument();

    const objectToAxiosParams = useBackendMutationSpy.mock.calls[0][0];
    const result = objectToAxiosParams({
      announcementText: "No dates",
      startDate: "",
      endDate: "",
    });
    expect(result.params).toEqual({
      id: 5,
      commonsId: 1,
      announcementText: "No dates",
    });
    expect(result.params).not.toHaveProperty("startDate");
    expect(result.params).not.toHaveProperty("endDate");

    useBackendMutationSpy.mockRestore();
  });
});
