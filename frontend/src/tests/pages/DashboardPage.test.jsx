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
      screen.getByTestId("DashboardPage-LeaderboardSection"),
    ).toBeInTheDocument();

    const totalFarmersCard = (
      await screen.findByText(/total farmers/i)
    ).closest(".card");
    expect(within(totalFarmersCard).getByText("4")).toBeInTheDocument();
  });

  test("clicking the Back button navigates back", async () => {
    renderWithRoute("/dashboard/7");

    const backButton = await screen.findByTestId("DashboardPage-back-button");
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("toggling 'Show Dashboard to Students' calls the dashboardSettings endpoint", async () => {
    renderWithRoute("/dashboard/7");

    const masterSwitch = await screen.findByTestId(
      "DashboardPage-showDashboard",
    );
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
  });

  test("toggling a section's visibility switch calls the dashboardSettings endpoint", async () => {
    renderWithRoute("/dashboard/7");

    const overviewSwitch = await screen.findByTestId(
      "DashboardPage-OverviewSection-visible-switch",
    );
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
  });

  test.each([
    ["CowsPerFarmerSection", "showCowsPerFarmerSection"],
    ["HistogramSection", "showHistogramSection"],
    ["TrendsSection", "showTrendsSection"],
    ["LeaderboardSection", "showFarmerLeaderboardSection"],
  ])(
    "toggling the %s visibility switch calls the dashboardSettings endpoint",
    async (sectionName, fieldName) => {
      renderWithRoute("/dashboard/7");

      const sectionSwitch = await screen.findByTestId(
        `DashboardPage-${sectionName}-visible-switch`,
      );
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
