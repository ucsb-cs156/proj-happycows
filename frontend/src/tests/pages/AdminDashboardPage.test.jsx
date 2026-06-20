import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router";
import "@testing-library/jest-dom";
import AdminDashboardPage from "main/pages/AdminDashboardPage";

import { QueryClient, QueryClientProvider } from "react-query";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { beforeEach, describe, expect, test } from "vitest";
import { daysSinceTimestamp } from "main/utils/dateUtils";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const axiosMock = new AxiosMockAdapter(axios);

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

function renderWithRoute(initialEntry, routePath = "/admin/dashboard/:id") {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path={routePath} element={<AdminDashboardPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  axiosMock.reset();
  axiosMock
    .onGet("/api/currentUser")
    .reply(200, apiCurrentUserFixtures.userOnly);
  axiosMock
    .onGet("/api/systemInfo")
    .reply(200, systemInfoFixtures.showingNeither);

  axiosMock.onGet("/api/commons/plus").reply((config) => {
    if (config.params?.id === "7") {
      return [
        200,
        {
          commons: {
            id: 7,
            name: "Test Commons 7",
            hidden: false,
            startingDate: "2025-01-01T00:00:00",
          },
          totalUsers: 4,
          totalCows: 11,
          averageCowsPerFarmer: 2.75,
          medianCowsPerFarmer: 2.5,
          minimumCowsPerFarmer: 1,
          maximumCowsPerFarmer: 5,
          standardDeviationCowsPerFarmer: 1.479,
        },
      ];
    }
    if (config.params?.id === "123") {
      return [
        200,
        {
          commons: {
            id: 123,
            name: "Test Commons 123",
            hidden: true,
            startingDate: "2024-06-01T00:00:00",
          },
          totalUsers: 2,
          totalCows: 9,
          averageCowsPerFarmer: 4.5,
          medianCowsPerFarmer: 4.5,
          minimumCowsPerFarmer: 3,
          maximumCowsPerFarmer: 6,
          standardDeviationCowsPerFarmer: 1.5,
        },
      ];
    }
    if (config.params?.id === "55") {
      return [
        200,
        {
          commons: {
            id: 55,
            name: "Test Commons 55",
            hidden: false,
          },
          totalUsers: 6,
          totalCows: 8,
        },
      ];
    }
    return [404, {}];
  });
});

describe("AdminDashboardPage", () => {
  test("renders dashboard with name heading, overview cards, and backend statistics", async () => {
    renderWithRoute("/admin/dashboard/7");

    const expectedDays = daysSinceTimestamp("2025-01-01T00:00:00");

    const mainHeading = await screen.findByRole("heading", {
      name: /test commons 7/i,
    });
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading.tagName).toBe("H1");
    expect(mainHeading.querySelector("i")).toBeNull();

    expect(screen.getByRole("heading", { name: /^dashboard$/i })).toBeInTheDocument();

    expect(screen.queryByText(/commons details/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /participation metrics/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /additional insights/i }),
    ).not.toBeInTheDocument();

    expect(screen.getByText(/total farmers/i)).toBeInTheDocument();
    expect(screen.getByText(/total cows/i)).toBeInTheDocument();
    expect(screen.getByText(/days active/i)).toBeInTheDocument();
    expect(screen.getByText(/^id$/i)).toBeInTheDocument();
    expect(screen.getByText(/start date/i)).toBeInTheDocument();

    expect(await screen.findByText("4")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText(String(expectedDays))).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("2025-01-01")).toBeInTheDocument();

    expect(
      screen.getByText(/^average number of cows per farmer:$/i, {
        selector: "strong",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("2.75")).toBeInTheDocument();
    expect(screen.getByText("2.5")).toBeInTheDocument();
    expect(screen.getByText("1.479")).toBeInTheDocument();
    expect(
      screen.getByText(
        /histogram\s*\/\s*distribution of cows per farmer will go here/i,
      ),
    ).toBeInTheDocument();
  });

  test("renders hidden icon in title only when commons is hidden", async () => {
    renderWithRoute("/admin/dashboard/123");

    const mainHeading = await screen.findByRole("heading", {
      name: /test commons 123/i,
    });
    const icon = mainHeading.querySelector("i");
    expect(icon).toHaveClass("fa-solid", "fa-eye-slash");
    expect(screen.queryByText(/hidden/i)).not.toBeInTheDocument();
  });

  test("renders safely when id is missing", () => {
    renderWithRoute("/admin/dashboard", "/admin/dashboard");

    expect(screen.getByRole("heading", { name: /^--$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^dashboard$/i }),
    ).toBeInTheDocument();
    expect(
      axiosMock.history.get.filter((call) => call.url === "/api/commons/plus"),
    ).toHaveLength(0);
  });

  test("updates dashboard data when dashboard id changes", async () => {
    function DashboardHarness() {
      const navigate = useNavigate();
      return (
        <>
          <button onClick={() => navigate("/admin/dashboard/123")}>
            Switch Dashboard
          </button>
          <Routes>
            <Route
              path="/admin/dashboard/:id"
              element={<AdminDashboardPage />}
            />
          </Routes>
        </>
      );
    }

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin/dashboard/7"]}>
          <DashboardHarness />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /switch dashboard/i }));
    expect(await screen.findByText("2")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /test commons 123/i })).toBeInTheDocument();
  });

  test("shows fallback values when startingDate and stats are missing", async () => {
    renderWithRoute("/admin/dashboard/55");

    expect(await screen.findByText("6")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();

    const daysActiveCard = screen
      .getByText(/days active/i)
      .closest(".card")
      .querySelector(".card-text");
    expect(daysActiveCard).toHaveTextContent("--");

    const startDateCard = screen
      .getByText(/start date/i)
      .closest(".card")
      .querySelector(".card-text");
    expect(startDateCard).toHaveTextContent("--");

    expect(screen.getAllByText("--").length).toBeGreaterThanOrEqual(6);
  });
});
