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
            startingDate: "2025-01-01T00:00:00",
          },
          totalUsers: 4,
          totalCows: 11,
        },
      ];
    }
    if (config.params?.id === "123") {
      return [
        200,
        {
          commons: {
            startingDate: "2024-06-01T00:00:00",
          },
          totalUsers: 2,
          totalCows: 9,
        },
      ];
    }
    if (config.params?.id === "55") {
      return [
        200,
        {
          totalUsers: 6,
          totalCows: 8,
        },
      ];
    }
    return [404, {}];
  });
});

describe("AdminDashboardPage", () => {
  test("renders full dashboard content for a valid id", async () => {
    renderWithRoute("/admin/dashboard/7");

    const expectedDays = daysSinceTimestamp("2025-01-01T00:00:00");

    expect(
      screen.getByRole("heading", { name: /dashboard/i }),
    ).toBeInTheDocument();

    const idLabel = screen.getByText(/^commons id:$/i, { selector: "strong" });
    expect(idLabel.closest("p")).toHaveTextContent(/commons id:\s*7/i);

    expect(
      screen.getByRole("heading", { name: /overview/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /commons details/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /participation metrics/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /farmer cow distribution/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /trends over time/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /additional insights/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/total farmers/i)).toBeInTheDocument();
    expect(screen.getByText(/total cows/i)).toBeInTheDocument();
    expect(screen.queryByText(/commons balance/i)).not.toBeInTheDocument();
    expect(screen.getByText(/days active/i)).toBeInTheDocument();
    expect(await screen.findByText("4")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText(String(expectedDays))).toBeInTheDocument();

    expect(
      screen.getByText(/^name:$/i, { selector: "strong" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/^status:$/i, { selector: "strong" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/^start date:$/i, { selector: "strong" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/^active farmers:$/i, { selector: "strong" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/^inactive farmers:$/i, { selector: "strong" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/^avg cows per farmer:$/i, { selector: "strong" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /histogram\s*\/\s*distribution of cows per farmer will go here/i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByText(/cows over time/i)).toBeInTheDocument();
    expect(screen.getByText(/farmers over time/i)).toBeInTheDocument();

    expect(screen.getAllByText(/chart placeholder/i)).toHaveLength(2);

    expect(
      screen.getByText(/future analytics and breakdowns will be added here\./i),
    ).toBeInTheDocument();
  });

  test("renders safely when id is missing", () => {
    renderWithRoute("/admin/dashboard", "/admin/dashboard");

    expect(
      screen.getByRole("heading", { name: /dashboard/i }),
    ).toBeInTheDocument();

    const idLabel = screen.getByText(/^commons id:$/i, { selector: "strong" });
    expect(idLabel.closest("p").textContent).not.toMatch(/\d+/);
    expect(screen.getAllByText("--")).toHaveLength(9);
    expect(
      axiosMock.history.get.filter((call) => call.url === "/api/commons/plus"),
    ).toHaveLength(0);
  });

  test("renders different ids correctly (prevents hardcoding)", async () => {
    renderWithRoute("/admin/dashboard/123");
    const expectedDays = daysSinceTimestamp("2024-06-01T00:00:00");

    const idLabel = screen.getByText(/^commons id:$/i, { selector: "strong" });
    expect(idLabel.closest("p")).toHaveTextContent(/commons id:\s*123/i);
    expect(idLabel.closest("p")).not.toHaveTextContent(/commons id:\s*7/i);
    expect(await screen.findByText("2")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText(String(expectedDays))).toBeInTheDocument();
  });

  test("updates stats when dashboard id changes", async () => {
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
  });

  test("shows fallback days active when startingDate is missing", async () => {
    renderWithRoute("/admin/dashboard/55");

    expect(await screen.findByText("6")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getAllByText("--")).toHaveLength(7);
  });
});
