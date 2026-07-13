import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import "@testing-library/jest-dom";
import DashboardPage from "main/pages/DashboardPage";

import { QueryClient, QueryClientProvider } from "react-query";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    __esModule: true,
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

const axiosMock = new AxiosMockAdapter(axios);

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

function renderWithRoute(initialEntry, routePath = "/dashboard/:commonsId") {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path={routePath} element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const baseCommonsPlus = {
  commons: {
    id: 7,
    name: "Test Commons 7",
    hidden: false,
    startingDate: "2025-01-01T00:00:00",
    showLeaderboard: true,
    showOverviewSection: true,
    showCowsPerFarmerSection: true,
    showHistogramSection: true,
    showTrendsSection: true,
    showHealthSection: true,
    showTotalCowsSection: true,
    showFarmerLeaderboardSection: true,
  },
  totalUsers: 4,
  totalCows: 11,
  averageCowsPerFarmer: 2.75,
  medianCowsPerFarmer: 2.5,
  minimumCowsPerFarmer: 1,
  maximumCowsPerFarmer: 5,
  standardDeviationCowsPerFarmer: 1.479,
};

beforeEach(() => {
  axiosMock.reset();
  axiosMock.resetHistory();
  axiosMock
    .onGet("/api/systemInfo")
    .reply(200, systemInfoFixtures.showingNeither);
  axiosMock.onGet("/api/commons/numcows").reply(200, [1, 2, 3, 5, 10, 15]);
  axiosMock.onGet("/api/commons/timeseries").reply(200, []);
  axiosMock.onGet("/api/usercommons/commons/all").reply(200, []);
  axiosMock.onPut("/api/commons/dashboardSettings").reply(200, {
    ...baseCommonsPlus.commons,
  });
});

describe("DashboardPage as admin", () => {
  beforeEach(() => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock.onGet("/api/commons/plus").reply(200, baseCommonsPlus);
  });

  test("renders dashboard with overview, admin controls, and all sections", async () => {
    renderWithRoute("/dashboard/7");

    const mainHeading = await screen.findByRole("heading", {
      name: /test commons 7/i,
    });
    expect(mainHeading).toBeInTheDocument();

    expect(screen.getByTestId("DashboardPage-showDashboard")).toBeChecked();
    expect(screen.getByTestId("DashboardPage-viewAsStudent")).not.toBeChecked();

    expect(
      screen.getByTestId("DashboardPage-OverviewSection"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("DashboardPage-CowsPerFarmerSection"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("DashboardPage-HistogramSection"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("DashboardPage-TrendsSection"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("DashboardPage-HealthSection"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("DashboardPage-TotalCowsSection"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("DashboardPage-LeaderboardSection"),
    ).toBeInTheDocument();

    const totalFarmersCard = (
      await screen.findByText(/total farmers/i)
    ).closest(".card");
    expect(within(totalFarmersCard).getByText("4")).toBeInTheDocument();

    const totalCowsCard = screen
      .getByText("Total Cows", { selector: ".card-title" })
      .closest(".card");
    expect(within(totalCowsCard).getByText("11")).toBeInTheDocument();

    const averageCard = screen.getByText("Average").closest(".card");
    expect(within(averageCard).getByText("2.8")).toBeInTheDocument();

    const medianCard = screen.getByText("Median").closest(".card");
    expect(within(medianCard).getByText("2.5")).toBeInTheDocument();

    const minCard = screen.getByText("Min").closest(".card");
    expect(within(minCard).getByText("1.0")).toBeInTheDocument();

    const maxCard = screen.getByText("Max").closest(".card");
    expect(within(maxCard).getByText("5.0")).toBeInTheDocument();

    const stdDevCard = screen.getByText("StdDev").closest(".card");
    expect(within(stdDevCard).getByText("1.5")).toBeInTheDocument();
  });

  test("shows a loading message before the commons data has loaded", async () => {
    let resolvePlus;
    const plusPromise = new Promise((resolve) => {
      resolvePlus = resolve;
    });
    axiosMock
      .onGet("/api/commons/plus")
      .reply(() => plusPromise.then(() => [200, baseCommonsPlus]));

    renderWithRoute("/dashboard/7");

    expect(await screen.findByText(/loading/i)).toBeInTheDocument();

    resolvePlus();

    await screen.findByRole("heading", { name: /test commons 7/i });
    expect(screen.queryByText(/loading\.\.\./i)).not.toBeInTheDocument();
  });

  test("shows the eye-slash icon when the commons is hidden", async () => {
    axiosMock.onGet("/api/commons/plus").reply(200, {
      ...baseCommonsPlus,
      commons: {
        ...baseCommonsPlus.commons,
        hidden: true,
      },
    });

    renderWithRoute("/dashboard/7");

    const mainHeading = await screen.findByRole("heading", {
      name: /test commons 7/i,
    });
    expect(mainHeading.querySelector(".fa-eye-slash")).toBeInTheDocument();
  });

  test("does not show the eye-slash icon when the commons is not hidden", async () => {
    renderWithRoute("/dashboard/7");

    const mainHeading = await screen.findByRole("heading", {
      name: /test commons 7/i,
    });
    expect(mainHeading.querySelector(".fa-eye-slash")).not.toBeInTheDocument();
  });

  test("clicking the Back button navigates back", async () => {
    renderWithRoute("/dashboard/7");

    const backButton = await screen.findByTestId("DashboardPage-back-button");
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("toggling 'Show Dashboard to Students' calls the dashboardSettings endpoint and updates the switch", async () => {
    // Use a stateful mock so that, like the real backend, the GET response
    // reflects the values most recently saved via PUT. This ensures the
    // toggle isn't just sent to the backend, but also actually reflected
    // back in the UI after the query cache is invalidated and refetched.
    let commons = { ...baseCommonsPlus.commons };
    axiosMock
      .onGet("/api/commons/plus")
      .reply(() => [200, { ...baseCommonsPlus, commons }]);
    axiosMock.onPut("/api/commons/dashboardSettings").reply((config) => {
      const body = JSON.parse(config.data);
      commons = { ...commons, ...body };
      return [200, commons];
    });

    renderWithRoute("/dashboard/7");

    const masterSwitch = await screen.findByTestId(
      "DashboardPage-showDashboard",
    );
    expect(masterSwitch).toBeChecked();
    fireEvent.click(masterSwitch);

    await waitFor(() => {
      expect(
        axiosMock.history.put.filter(
          (call) => call.url === "/api/commons/dashboardSettings",
        ),
      ).toHaveLength(1);
    });
    const body = JSON.parse(axiosMock.history.put[0].data);
    expect(body.showLeaderboard).toBe(false);

    await waitFor(() => {
      expect(
        screen.getByTestId("DashboardPage-showDashboard"),
      ).not.toBeChecked();
    });
  });

  test("toggling a section's visibility switch calls the dashboardSettings endpoint and updates the switch", async () => {
    // Stateful mock, see comment in the test above for rationale.
    let commons = { ...baseCommonsPlus.commons };
    axiosMock
      .onGet("/api/commons/plus")
      .reply(() => [200, { ...baseCommonsPlus, commons }]);
    axiosMock.onPut("/api/commons/dashboardSettings").reply((config) => {
      const body = JSON.parse(config.data);
      commons = { ...commons, ...body };
      return [200, commons];
    });

    renderWithRoute("/dashboard/7");

    const overviewSwitch = await screen.findByTestId(
      "DashboardPage-OverviewSection-visible-switch",
    );
    expect(overviewSwitch).toHaveAttribute(
      "id",
      "DashboardPage-OverviewSection-visible-switch",
    );
    expect(overviewSwitch).toBeChecked();
    const overviewCard = screen.getByTestId("DashboardPage-OverviewSection");
    expect(
      within(overviewCard).getByText("Shown to Students"),
    ).toBeInTheDocument();

    fireEvent.click(overviewSwitch);

    await waitFor(() => {
      expect(
        axiosMock.history.put.filter(
          (call) => call.url === "/api/commons/dashboardSettings",
        ),
      ).toHaveLength(1);
    });
    const body = JSON.parse(axiosMock.history.put[0].data);
    expect(body.showOverviewSection).toBe(false);

    await waitFor(() => {
      expect(
        screen.getByTestId("DashboardPage-OverviewSection-visible-switch"),
      ).not.toBeChecked();
    });
    expect(
      within(overviewCard).getByText("Hidden from Students"),
    ).toBeInTheDocument();
  });

  test("shows 'Hidden from Students' label for a section marked not visible", async () => {
    axiosMock.onGet("/api/commons/plus").reply(200, {
      ...baseCommonsPlus,
      commons: {
        ...baseCommonsPlus.commons,
        showOverviewSection: false,
      },
    });

    renderWithRoute("/dashboard/7");

    const overviewSwitch = await screen.findByTestId(
      "DashboardPage-OverviewSection-visible-switch",
    );
    expect(overviewSwitch).not.toBeChecked();
    expect(
      screen.getByText("Hidden from Students", { selector: "label" }),
    ).toBeInTheDocument();
  });

  test.each([
    ["CowsPerFarmerSection", "showCowsPerFarmerSection"],
    ["HistogramSection", "showHistogramSection"],
    ["TrendsSection", "showTrendsSection"],
    ["HealthSection", "showHealthSection"],
    ["TotalCowsSection", "showTotalCowsSection"],
    ["LeaderboardSection", "showFarmerLeaderboardSection"],
  ])(
    "toggling the %s visibility switch calls the dashboardSettings endpoint and updates the switch",
    async (sectionName, fieldName) => {
      // Stateful mock, see comment in the "Overview" toggle test above.
      let commons = { ...baseCommonsPlus.commons };
      axiosMock
        .onGet("/api/commons/plus")
        .reply(() => [200, { ...baseCommonsPlus, commons }]);
      axiosMock.onPut("/api/commons/dashboardSettings").reply((config) => {
        const body = JSON.parse(config.data);
        commons = { ...commons, ...body };
        return [200, commons];
      });

      renderWithRoute("/dashboard/7");

      const sectionSwitch = await screen.findByTestId(
        `DashboardPage-${sectionName}-visible-switch`,
      );
      expect(sectionSwitch).toBeChecked();
      fireEvent.click(sectionSwitch);

      await waitFor(() => {
        expect(
          axiosMock.history.put.filter(
            (call) => call.url === "/api/commons/dashboardSettings",
          ),
        ).toHaveLength(1);
      });
      const body = JSON.parse(axiosMock.history.put[0].data);
      expect(body[fieldName]).toBe(false);

      await waitFor(() => {
        expect(
          screen.getByTestId(`DashboardPage-${sectionName}-visible-switch`),
        ).not.toBeChecked();
      });
    },
  );

  test("'View as Student' hides sections marked not visible and admin controls remain", async () => {
    axiosMock.onGet("/api/commons/plus").reply(200, {
      ...baseCommonsPlus,
      commons: {
        ...baseCommonsPlus.commons,
        showHistogramSection: false,
      },
    });

    renderWithRoute("/dashboard/7");

    await screen.findByTestId("DashboardPage-HistogramSection");

    const viewAsStudentSwitch = screen.getByTestId(
      "DashboardPage-viewAsStudent",
    );
    fireEvent.click(viewAsStudentSwitch);

    await waitFor(() => {
      expect(
        screen.queryByTestId("DashboardPage-HistogramSection"),
      ).not.toBeInTheDocument();
    });
    // The admin master controls are still shown even in "View as Student" mode
    expect(
      screen.getByTestId("DashboardPage-showDashboard"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("DashboardPage-OverviewSection-visible-switch"),
    ).not.toBeInTheDocument();
  });

  test("shows 'not authorized' message when viewing as student and dashboard hidden", async () => {
    axiosMock.onGet("/api/commons/plus").reply(200, {
      ...baseCommonsPlus,
      commons: {
        ...baseCommonsPlus.commons,
        showLeaderboard: false,
      },
    });

    renderWithRoute("/dashboard/7");

    await screen.findByTestId("DashboardPage-showDashboard");
    fireEvent.click(screen.getByTestId("DashboardPage-viewAsStudent"));

    expect(
      await screen.findByText(/you're not authorized to see the dashboard/i),
    ).toBeInTheDocument();
  });

  test("renders safely when id is missing", async () => {
    renderWithRoute("/dashboard", "/dashboard");

    await waitFor(() => {
      expect(
        axiosMock.history.get.filter(
          (call) => call.url === "/api/commons/plus",
        ),
      ).toHaveLength(0);
    });
  });
});

describe("DashboardPage as student", () => {
  beforeEach(() => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
  });

  test("renders dashboard sections marked visible when showLeaderboard is true", async () => {
    axiosMock.onGet("/api/commons/plus").reply(200, baseCommonsPlus);

    renderWithRoute("/dashboard/7");

    expect(
      await screen.findByTestId("DashboardPage-OverviewSection"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("DashboardPage-showDashboard"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("DashboardPage-OverviewSection-visible-switch"),
    ).not.toBeInTheDocument();
  });

  test("hides sections that the instructor has marked not visible", async () => {
    axiosMock.onGet("/api/commons/plus").reply(200, {
      ...baseCommonsPlus,
      commons: {
        ...baseCommonsPlus.commons,
        showTrendsSection: false,
      },
    });

    renderWithRoute("/dashboard/7");

    await screen.findByTestId("DashboardPage-OverviewSection");
    expect(
      screen.queryByTestId("DashboardPage-TrendsSection"),
    ).not.toBeInTheDocument();
  });

  test("hides the health section when the instructor has marked it not visible", async () => {
    axiosMock.onGet("/api/commons/plus").reply(200, {
      ...baseCommonsPlus,
      commons: {
        ...baseCommonsPlus.commons,
        showHealthSection: false,
      },
    });

    renderWithRoute("/dashboard/7");

    await screen.findByTestId("DashboardPage-OverviewSection");
    expect(
      screen.queryByTestId("DashboardPage-HealthSection"),
    ).not.toBeInTheDocument();
  });

  test("hides the total cows section when the instructor has marked it not visible", async () => {
    axiosMock.onGet("/api/commons/plus").reply(200, {
      ...baseCommonsPlus,
      commons: {
        ...baseCommonsPlus.commons,
        showTotalCowsSection: false,
      },
    });

    renderWithRoute("/dashboard/7");

    await screen.findByTestId("DashboardPage-OverviewSection");
    expect(
      screen.queryByTestId("DashboardPage-TotalCowsSection"),
    ).not.toBeInTheDocument();
  });

  test("hides the overview section when the instructor has marked it not visible", async () => {
    axiosMock.onGet("/api/commons/plus").reply(200, {
      ...baseCommonsPlus,
      commons: {
        ...baseCommonsPlus.commons,
        showOverviewSection: false,
      },
    });

    renderWithRoute("/dashboard/7");

    await screen.findByTestId("DashboardPage-CowsPerFarmerSection");
    expect(
      screen.queryByTestId("DashboardPage-OverviewSection"),
    ).not.toBeInTheDocument();
  });

  test("hides the cows-per-farmer section when the instructor has marked it not visible", async () => {
    axiosMock.onGet("/api/commons/plus").reply(200, {
      ...baseCommonsPlus,
      commons: {
        ...baseCommonsPlus.commons,
        showCowsPerFarmerSection: false,
      },
    });

    renderWithRoute("/dashboard/7");

    await screen.findByTestId("DashboardPage-OverviewSection");
    expect(
      screen.queryByTestId("DashboardPage-CowsPerFarmerSection"),
    ).not.toBeInTheDocument();
  });

  test("hides the leaderboard section when the instructor has marked it not visible", async () => {
    axiosMock.onGet("/api/commons/plus").reply(200, {
      ...baseCommonsPlus,
      commons: {
        ...baseCommonsPlus.commons,
        showFarmerLeaderboardSection: false,
      },
    });

    renderWithRoute("/dashboard/7");

    await screen.findByTestId("DashboardPage-OverviewSection");
    expect(
      screen.queryByTestId("DashboardPage-LeaderboardSection"),
    ).not.toBeInTheDocument();
  });

  test("shows 'not authorized' message when showLeaderboard is false", async () => {
    axiosMock.onGet("/api/commons/plus").reply(200, {
      ...baseCommonsPlus,
      commons: {
        ...baseCommonsPlus.commons,
        showLeaderboard: false,
      },
    });

    renderWithRoute("/dashboard/7");

    expect(
      await screen.findByText(/you're not authorized to see the dashboard/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("DashboardPage-OverviewSection"),
    ).not.toBeInTheDocument();
  });
});
