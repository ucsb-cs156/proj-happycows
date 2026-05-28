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
import * as useBackendModule from "main/utils/useBackend";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    __esModule: true,
    ...originalModule,
    useParams: () => ({
      commonsId: 1,
    }),
    useNavigate: () => mockedNavigate,
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
    axiosMock.onGet("/api/commons/plus", { params: { id: 1 } }).reply(200, {
      commons: {
        id: 1,
        name: "Sample Commons",
      },
      totalPlayers: 5,
      totalCows: 5,
    });
    axiosMock
      .onGet("/api/announcements/getbycommonsid", {
        params: { commonsId: 1 },
      })
      .reply(200, { content: [] });
  });

  test("renders page without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCreateAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Create Announcement for Commons Sample Commons"),
    ).toBeInTheDocument();
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

  test("creates announcement without optional dates", async () => {
    axiosMock.onPost("/api/announcements/post").reply(200, {
      id: 5,
      commonsId: 1,
      announcementText: "Hello commons",
      startDate: "2026-05-27T00:00:00",
      endDate: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCreateAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Create Announcement for Commons Sample Commons"),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("AnnouncementForm-announcementText"), {
      target: { value: "Hello commons" },
    });
    fireEvent.click(screen.getByTestId("AnnouncementForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].params).toEqual({
      commonsId: 1,
      announcementText: "Hello commons",
    });
    expect(mockToast).toHaveBeenCalledWith("Announcement created - id: 5");
    expect(mockedNavigate).toHaveBeenCalledWith({
      to: "/admin/announcements/1",
    });
  });

  test("creates announcement with formatted start and end dates", async () => {
    axiosMock.onPost("/api/announcements/post").reply(200, {
      id: 6,
      commonsId: 1,
      announcementText: "Dated announcement",
      startDate: "2004-12-10T00:12:00",
      endDate: "2004-12-10T13:45:00",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCreateAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Create Announcement for Commons Sample Commons"),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("AnnouncementForm-startDate"), {
      target: { value: "2004-12-10T00:12" },
    });
    fireEvent.change(screen.getByTestId("AnnouncementForm-endDate"), {
      target: { value: "2004-12-10T13:45" },
    });
    fireEvent.change(screen.getByTestId("AnnouncementForm-announcementText"), {
      target: { value: "Dated announcement" },
    });
    fireEvent.click(screen.getByTestId("AnnouncementForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].params).toEqual({
      commonsId: 1,
      announcementText: "Dated announcement",
      startDate: new Date("2004-12-10T00:12").toISOString(),
      endDate: new Date("2004-12-10T13:45").toISOString(),
    });
    expect(mockToast).toHaveBeenCalledWith("Announcement created - id: 6");
    expect(mockedNavigate).toHaveBeenCalledWith({
      to: "/admin/announcements/1",
    });
  });

  test("objectToAxiosParams omits blank optional dates before axios", async () => {
    const useBackendMutationSpy = vi
      .spyOn(useBackendModule, "useBackendMutation")
      .mockReturnValue({ mutate: vi.fn(), isSuccess: false });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <AdminCreateAnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Create Announcement for Commons Sample Commons"),
    ).toBeInTheDocument();

    const objectToAxiosParams = useBackendMutationSpy.mock.calls[0][0];
    const result = objectToAxiosParams({
      announcementText: "No dates",
      startDate: "",
      endDate: "",
    });
    expect(result.params).toEqual({
      commonsId: 1,
      announcementText: "No dates",
    });
    expect(result.params).not.toHaveProperty("startDate");
    expect(result.params).not.toHaveProperty("endDate");

    useBackendMutationSpy.mockRestore();
  });
});
