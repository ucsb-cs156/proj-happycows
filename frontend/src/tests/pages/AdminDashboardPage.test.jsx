import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import "@testing-library/jest-dom";

import AdminDashboardPage from "main/pages/AdminDashboardPage";

function renderWithRoute(initialEntry, routePath = "/admin/dashboard/:id") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={routePath} element={<AdminDashboardPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AdminDashboardPage", () => {
  test("renders dashboard title, sections, cards, and placeholders for a valid commons id", () => {
    renderWithRoute("/admin/dashboard/7");

    expect(
      screen.getByRole("heading", { name: /dashboard/i }),
    ).toBeInTheDocument();

    const commonsIdStrong = screen.getByText(/^commons id:$/i, {
      selector: "strong",
    });
    expect(commonsIdStrong).toBeInTheDocument();
    expect(commonsIdStrong.closest("p")).toHaveTextContent(/commons id:\s*7/i);

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
    expect(screen.getByText(/commons balance/i)).toBeInTheDocument();
    expect(screen.getByText(/days active/i)).toBeInTheDocument();

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
        /histogram \/ distribution of cows per farmer will go here/i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByText(/cows over time/i)).toBeInTheDocument();
    expect(screen.getByText(/farmers over time/i)).toBeInTheDocument();

    expect(
      screen.getAllByText(
        /chart placeholder \(x-axis:\s*days since commons start\)/i,
      ).length,
    ).toBeGreaterThanOrEqual(2);

    expect(
      screen.getByText(/future analytics and breakdowns will be added here\./i),
    ).toBeInTheDocument();

    expect(screen.getAllByText("--")).toHaveLength(10);
  });

  test("renders without crashing when no :id param is present (id undefined)", () => {
    renderWithRoute("/admin/dashboard", "/admin/dashboard");

    expect(
      screen.getByRole("heading", { name: /dashboard/i }),
    ).toBeInTheDocument();

    const commonsIdStrong = screen.getByText(/^commons id:$/i, {
      selector: "strong",
    });
    expect(commonsIdStrong).toBeInTheDocument();

    expect(commonsIdStrong.closest("p")).toHaveTextContent(/^commons id:\s*$/i);
    expect(commonsIdStrong.closest("p")).not.toHaveTextContent(/\d+/);
  });

  test("supports different ids (ensures id is not hard-coded)", () => {
    renderWithRoute("/admin/dashboard/123");

    const commonsIdStrong = screen.getByText(/^commons id:$/i, {
      selector: "strong",
    });
    expect(commonsIdStrong.closest("p")).toHaveTextContent(
      /commons id:\s*123/i,
    );
    expect(commonsIdStrong.closest("p")).not.toHaveTextContent(
      /commons id:\s*7/i,
    );
  });
});
