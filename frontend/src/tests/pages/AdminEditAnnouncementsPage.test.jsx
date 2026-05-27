import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminEditAnnouncementsPage from "main/pages/AdminEditAnnouncementsPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { announcementFixtures } from "fixtures/announcementFixtures";
import * as backend from "main/utils/useBackend";
import { vi } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    __esModule: true,
    ...originalModule,
    useParams: () => ({
      commonsId: 1,
      announcementId: 1,
    }),
    Navigate: (x) => {
      mockedNavigate(x);
      return null;
    },
    useNavigate: () => mockedNavigate,
  };
});

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

describe("AdminEditAnnouncementsPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

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
    axiosMock.onGet("/api/commons/plus").reply(200, {
      commons: {
        id: 1,
        name: "Sample Commons",
      },
      totalPlayers: 5,
      totalCows: 5,
    });
    axiosMock
      .onGet("/api/announcements/getbyid")
      .reply(200, announcementFixtures.oneAnnouncement);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders page without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminEditAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const heading = await screen.findByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent(
      "Edit Announcement for Commons Sample Commons",
    );
  });

  test("form is pre-populated with announcement data", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminEditAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const startDateField = await screen.findByTestId(
      "AnnouncementForm-startDate",
    );
    const endDateField = screen.getByTestId("AnnouncementForm-endDate");
    const announcementTextField = screen.getByTestId(
      "AnnouncementForm-announcementText",
    );
    const idField = screen.getByTestId("AnnouncementForm-id");

    await waitFor(() => {
      expect(idField).toHaveValue("1");
      expect(startDateField).toHaveValue("2024-12-12T00:00");
      expect(endDateField).toHaveValue("2025-12-12T00:00");
      expect(announcementTextField).toHaveValue(
        "System maintenance scheduled for next week.",
      );
    });
  });

  test("handles missing announcement data gracefully", () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/commons/plus?id=1")
      .reply(200, announcementFixtures.oneCommons);
    axiosMock.onGet("/api/announcements/getbyid?id=1").reply(200, null);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminEditAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Page should render without crashing even if announcement data is null
    expect(
      screen.getByTestId("AnnouncementForm-startDate"),
    ).toBeInTheDocument();
  });

  test("update mutation is configured with correct API request and invalidate key", () => {
    const queryClient = new QueryClient();
    const mutationSpy = vi.spyOn(backend, "useBackendMutation");

    try {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <AdminEditAnnouncementsPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(mutationSpy).toHaveBeenCalled();
      expect(mutationSpy.mock.calls[0][2]).toEqual(["/api/announcements?id=1"]);

      const mutationFn = mutationSpy.mock.calls[0][0];
      const result = mutationFn({
        id: 1,
        startDate: "2024-12-12T00:00",
        endDate: "2025-12-12T00:00",
        announcementText: "Updated announcement",
      });

      expect(result).toEqual({
        url: "/api/announcements/put",
        method: "PUT",
        params: {
          id: 1,
          commonsId: 1,
          startDate: "2024-12-12T00:00:00",
          endDate: "2025-12-12T00:00:00",
          announcementText: "Updated announcement",
        },
      });
    } finally {
      mutationSpy.mockRestore();
    }
  });

  test("update mutation omits endDate when not provided", () => {
    const queryClient = new QueryClient();
    const mutationSpy = vi.spyOn(backend, "useBackendMutation");

    try {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <AdminEditAnnouncementsPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      const mutationFn = mutationSpy.mock.calls[0][0];
      const result = mutationFn({
        id: 1,
        startDate: "2024-12-12T00:00",
        announcementText: "Updated announcement",
      });

      expect(result).toEqual({
        url: "/api/announcements/put",
        method: "PUT",
        params: {
          id: 1,
          commonsId: 1,
          startDate: "2024-12-12T00:00:00",
          announcementText: "Updated announcement",
        },
      });
      expect(result.params).not.toHaveProperty("endDate");
    } finally {
      mutationSpy.mockRestore();
    }
  });

  test("onSuccess shows toast with announcement details", () => {
    const queryClient = new QueryClient();
    const mutationSpy = vi.spyOn(backend, "useBackendMutation");

    try {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <AdminEditAnnouncementsPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      const options = mutationSpy.mock.calls[0][1];
      options.onSuccess({
        id: 1,
        startDate: "2024-12-12T00:00:00",
        endDate: "2025-12-12T00:00:00",
        announcementText: "Updated announcement",
      });

      expect(mockToast).toHaveBeenCalledWith(
        <div>
          Announcement successfully edited!
          <br />
          {`commonsId: 1`}
          <br />
          {`startDate: 2024-12-12T00:00:00`}
          <br />
          {`endDate: 2025-12-12T00:00:00`}
          <br />
          {`announcementText: Updated announcement`}
        </div>,
      );
    } finally {
      mutationSpy.mockRestore();
    }
  });

  test("When you fill in form and click submit, the right things happen", async () => {
    const queryClient = new QueryClient();
    axiosMock.onPut("/api/announcements/put").reply(200, {
      id: 1,
      commonsId: 1,
      startDate: "2026-05-17T14:00:00",
      endDate: "2026-12-17T14:00:00",
      announcementText: "My Updated Announcement",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminEditAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const heading = await screen.findByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent(
      "Edit Announcement for Commons Sample Commons",
    );

    const startDateField = await screen.findByTestId(
      "AnnouncementForm-startDate",
    );
    const endDateField = screen.getByTestId("AnnouncementForm-endDate");
    const announcementTextField = screen.getByTestId(
      "AnnouncementForm-announcementText",
    );
    const submitButton = screen.getByTestId("AnnouncementForm-submit");

    // Clear and update fields
    fireEvent.change(startDateField, {
      target: { value: "2026-05-17T14:00" },
    });
    fireEvent.change(endDateField, {
      target: { value: "2026-12-17T14:00" },
    });
    fireEvent.change(announcementTextField, {
      target: { value: "My Updated Announcement" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));

    expect(axiosMock.history.put[0].params).toEqual({
      id: 1,
      commonsId: 1,
      startDate: "2026-05-17T14:00:00",
      endDate: "2026-12-17T14:00:00",
      announcementText: "My Updated Announcement",
    });

    expect(mockToast).toHaveBeenCalledWith(
      <div>
        Announcement successfully edited!
        <br />
        {`commonsId: 1`}
        <br />
        {`startDate: 2026-05-17T14:00:00`}
        <br />
        {`endDate: 2026-12-17T14:00:00`}
        <br />
        {`announcementText: My Updated Announcement`}
      </div>,
    );

    expect(mockedNavigate).toHaveBeenCalledWith({
      to: "/admin/announcements/1",
    });
  });

  test("When you update only the announcement text and submit, the right things happen", async () => {
    const queryClient = new QueryClient();
    axiosMock.onPut("/api/announcements/put").reply(200, {
      id: 1,
      commonsId: 1,
      startDate: "2024-12-12T00:00:00",
      endDate: "2025-12-12T00:00:00",
      announcementText: "Just updated text",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminEditAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const announcementTextField = await screen.findByTestId(
      "AnnouncementForm-announcementText",
    );
    const submitButton = screen.getByTestId("AnnouncementForm-submit");

    fireEvent.change(announcementTextField, {
      target: { value: "Just updated text" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));

    expect(axiosMock.history.put[0].params).toEqual({
      id: 1,
      commonsId: 1,
      startDate: "2024-12-12T00:00:00",
      endDate: "2025-12-12T00:00:00",
      announcementText: "Just updated text",
    });
  });

  test("mutation uses announcementId when form data has no id", () => {
    const queryClient = new QueryClient();
    const mutationSpy = vi.spyOn(backend, "useBackendMutation");

    try {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <AdminEditAnnouncementsPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      const mutationFn = mutationSpy.mock.calls[0][0];
      // Test case: form data without id should use announcementId from URL params
      const result = mutationFn({
        startDate: "2024-12-12T00:00",
        endDate: "2025-12-12T00:00",
        announcementText: "Updated announcement",
        // Note: no id property - should fall back to announcementId which is 1
      });

      expect(result.params.id).toEqual(1);
    } finally {
      mutationSpy.mockRestore();
    }
  });

  test("page handles null editedAnnouncement and uses announcementId fallback", () => {
    const queryClient = new QueryClient();
    // Mock the announcement API to return null
    axiosMock.onGet("/api/announcements/getbyid?id=1").reply(200, null);
    const mutationSpy = vi.spyOn(backend, "useBackendMutation");

    try {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <AdminEditAnnouncementsPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      const mutationFn = mutationSpy.mock.calls[0][0];
      // When editedAnnouncement is null, the mutation should still work
      // and use announcementId from URL params
      const result = mutationFn({
        startDate: "2024-12-12T00:00",
        announcementText: "Updated with null editedAnnouncement",
      });

      // This verifies the optional chaining ?.id properly handles null/undefined
      expect(result.params.id).toEqual(1);
      expect(result.params.startDate).toEqual("2024-12-12T00:00:00");
    } finally {
      mutationSpy.mockRestore();
    }
  });
});
