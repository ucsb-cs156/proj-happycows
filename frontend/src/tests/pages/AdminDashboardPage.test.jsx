import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import "@testing-library/jest-dom";
import AdminDashboardPage from "main/pages/AdminDashboardPage";

import { QueryClient, QueryClientProvider } from "react-query";
import axios from "axios";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Vitest mock (prevents real network calls from useCurrentUser / react-query)
vi.mock("axios", () => ({
  default: { get: vi.fn() },
  get: vi.fn(),
}));

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
  vi.clearAllMocks();
  // default response for BasicLayout -> useCurrentUser
  axios.get.mockResolvedValue({
    data: { loggedIn: false, root: false, rolesList: [] },
  });
});

describe("AdminDashboardPage", () => {
  test("renders full dashboard content for a valid id", () => {
    renderWithRoute("/admin/dashboard/7");

    // Title
    expect(
      screen.getByRole("heading", { name: /dashboard/i }),
    ).toBeInTheDocument();

    // Commons ID is split across elements (<strong> + text), so assert on the parent <p>
    const idLabel = screen.getByText(/^commons id:$/i, { selector: "strong" });
    expect(idLabel.closest("p")).toHaveTextContent(/commons id:\s*7/i);

    // Sections
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

    // Overview metrics
    expect(screen.getByText(/total farmers/i)).toBeInTheDocument();
    expect(screen.getByText(/total cows/i)).toBeInTheDocument();
    expect(screen.getByText(/commons balance/i)).toBeInTheDocument();
    expect(screen.getByText(/days active/i)).toBeInTheDocument();

    // Commons details labels (anchor to avoid substring collisions)
    expect(
      screen.getByText(/^name:$/i, { selector: "strong" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/^status:$/i, { selector: "strong" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/^start date:$/i, { selector: "strong" }),
    ).toBeInTheDocument();

    // Participation metrics labels (anchored so Active != Inactive)
    expect(
      screen.getByText(/^active farmers:$/i, { selector: "strong" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/^inactive farmers:$/i, { selector: "strong" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/^avg cows per farmer:$/i, { selector: "strong" }),
    ).toBeInTheDocument();

    // Placeholder text
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

    // Count of "--" placeholders
    expect(screen.getAllByText("--")).toHaveLength(10);
  });

  test("renders safely when id is missing", () => {
    renderWithRoute("/admin/dashboard", "/admin/dashboard");

    expect(
      screen.getByRole("heading", { name: /dashboard/i }),
    ).toBeInTheDocument();

    const idLabel = screen.getByText(/^commons id:$/i, { selector: "strong" });
    // Parent <p> should not contain digits when id is undefined
    expect(idLabel.closest("p").textContent).not.toMatch(/\d+/);
  });

  test("renders different ids correctly (prevents hardcoding)", () => {
    renderWithRoute("/admin/dashboard/123");

    const idLabel = screen.getByText(/^commons id:$/i, { selector: "strong" });
    expect(idLabel.closest("p")).toHaveTextContent(/commons id:\s*123/i);
    expect(idLabel.closest("p")).not.toHaveTextContent(/commons id:\s*7/i);
  });
});
