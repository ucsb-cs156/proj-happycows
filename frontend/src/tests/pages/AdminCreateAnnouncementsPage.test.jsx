import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminCreateAnnouncementsPage from "main/pages/AdminCreateAnnouncementsPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import AdminAnnouncementsPage from "main/pages/AdminAnnouncementsPage";
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
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("AdminCreateAnnouncementsPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

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
  });

  test("renders page without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCreateAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Create Announcement")).toBeInTheDocument();
  });

  test("correct href for create announcements button as an admin", async () => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock.onGet("/api/commons/plus", { params: { id: 1 } }).reply(200, {
      commons: {
        id: 1,
        name: "Sample Commons",
      },
      totalPlayers: 5,
      totalCows: 5,
    });

    render(
      <QueryClientProvider client={queryClient}>
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

  test("create mutation is configured with correct API request and invalidate key", () => {
    const mutationSpy = vi.spyOn(backend, "useBackendMutation");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCreateAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(mutationSpy).toHaveBeenCalled();
    expect(mutationSpy.mock.calls[0][2]).toEqual(["/api/announcements/all"]);

    const mutationFn = mutationSpy.mock.calls[0][0];
    const result = mutationFn({
      startDate: "2024-12-12T00:00",
      endDate: "2025-12-12T00:00",
      announcementText: "Hello",
    });

    expect(result).toEqual({
      url: "/api/announcements/post",
      method: "POST",
      params: {
        commonsId: 1,
        startDate: "2024-12-12T00:00:00",
        endDate: "2025-12-12T00:00:00",
        announcementText: "Hello",
      },
    });

    mutationSpy.mockRestore();
  });

  test("create mutation omits endDate when not provided", () => {
    const mutationSpy = vi.spyOn(backend, "useBackendMutation");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCreateAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const mutationFn = mutationSpy.mock.calls[0][0];
    const result = mutationFn({
      startDate: "2024-12-12T00:00:00",
      announcementText: "Hello",
    });

    expect(result).toEqual({
      url: "/api/announcements/post",
      method: "POST",
      params: {
        commonsId: 1,
        startDate: "2024-12-12T00:00:00",
        announcementText: "Hello",
      },
    });
    expect(result.params).not.toHaveProperty("endDate");

    mutationSpy.mockRestore();
  });

  test("onSuccess shows toast with announcement details", () => {
    const mutationSpy = vi.spyOn(backend, "useBackendMutation");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCreateAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const options = mutationSpy.mock.calls[0][1];
    options.onSuccess({
      id: 5,
      startDate: "2024-12-12T00:00:00",
      endDate: "2025-12-12T00:00:00",
      announcementText: "Test announcement",
    });

    expect(mockToast).toHaveBeenCalledWith(
      <div>
        Announcement successfully created!
        <br />
        {`commonsId: 5`}
        <br />
        {`startDate: 2024-12-12T00:00:00`}
        <br />
        {`endDate: 2025-12-12T00:00:00`}
        <br />
        {`announcementText: Test announcement`}
      </div>,
    );

    mutationSpy.mockRestore();
  });

  test("When you fill in form and click submit, the right things happen", async () => {
    axiosMock.onPost("/api/announcements/post").reply(200, {
      id: 5,
      commonsId: 1,
      startDate: "2026-05-17T14:00:00",
      endDate: "2026-12-17T14:00:00",
      announcementText: "My New Announcement",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCreateAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Create Announcement")).toBeInTheDocument();

    const startDateField = screen.getByTestId("AnnouncementForm-startDate");
    const endDateField = screen.getByTestId("AnnouncementForm-endDate");
    const announcementTextField = screen.getByTestId(
      "AnnouncementForm-announcementText",
    );
    const submitButton = screen.getByTestId("AnnouncementForm-submit");

    fireEvent.change(startDateField, {
      target: { value: "2026-05-17T14:00" },
    });
    fireEvent.change(endDateField, {
      target: { value: "2026-12-17T14:00" },
    });
    fireEvent.change(announcementTextField, {
      target: { value: "My New Announcement" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      commonsId: 1,
      startDate: "2026-05-17T14:00:00",
      endDate: "2026-12-17T14:00:00",
      announcementText: "My New Announcement",
    });

    expect(mockToast).toHaveBeenCalledWith(
      <div>
        Announcement successfully created!
        <br />
        {`commonsId: 5`}
        <br />
        {`startDate: 2026-05-17T14:00:00`}
        <br />
        {`endDate: 2026-12-17T14:00:00`}
        <br />
        {`announcementText: My New Announcement`}
      </div>,
    );

    expect(mockedNavigate).toHaveBeenCalledWith({
      to: "/admin/announcements/1",
    });
  });
});
