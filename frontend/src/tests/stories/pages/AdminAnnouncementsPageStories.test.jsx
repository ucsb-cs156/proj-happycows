import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { announcementFixtures } from "fixtures/announcementFixtures";
import CreateAnnouncementsStoryMeta, {
  Default as CreateAnnouncementsStory,
} from "../../../stories/pages/AdminCreateAnnouncementsPage.stories";
import EditAnnouncementsStoryMeta, {
  Default as EditAnnouncementsStory,
} from "../../../stories/pages/AdminEditAnnouncementsPage.stories";

describe("Announcement page stories", () => {
  let axiosMock;

  const renderStory = (Story) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);
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
    axiosMock?.restore();
  });

  test("create and edit stories expose expected metadata and handlers", () => {
    expect(CreateAnnouncementsStoryMeta.title).toBe(
      "pages/AdminCreateAnnouncementsPage",
    );
    expect(CreateAnnouncementsStoryMeta.component).toBeTruthy();
    expect(CreateAnnouncementsStory.parameters.msw).toHaveLength(3);

    expect(EditAnnouncementsStoryMeta.title).toBe(
      "pages/AdminEditAnnouncementsPage",
    );
    expect(EditAnnouncementsStoryMeta.component).toBeTruthy();
    expect(EditAnnouncementsStory.parameters.msw).toHaveLength(4);
  });

  test("create story renders expected heading and empty form state", async () => {
    renderStory(CreateAnnouncementsStory);

    expect(
      await screen.findByText("Create Announcement for Commons Sample Commons"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("AnnouncementForm-id")).not.toBeInTheDocument();
    expect(screen.getByTestId("AnnouncementForm-startDate")).toHaveValue("");
    expect(screen.getByTestId("AnnouncementForm-endDate")).toHaveValue("");
    expect(screen.getByTestId("AnnouncementForm-announcementText")).toHaveValue(
      "",
    );
  });

  test("edit story renders expected heading and pre-populated form state", async () => {
    renderStory(EditAnnouncementsStory);

    expect(
      await screen.findByText("Edit Announcement for Commons Sample Commons"),
    ).toBeInTheDocument();
    expect(await screen.findByTestId("AnnouncementForm-id")).toHaveValue("1");

    await waitFor(() => {
      expect(screen.getByTestId("AnnouncementForm-startDate")).toHaveValue(
        "2024-12-12T00:00",
      );
      expect(screen.getByTestId("AnnouncementForm-endDate")).toHaveValue(
        "2025-12-12T00:00",
      );
      expect(
        screen.getByTestId("AnnouncementForm-announcementText"),
      ).toHaveValue("System maintenance scheduled for next week.");
    });
  });
});
