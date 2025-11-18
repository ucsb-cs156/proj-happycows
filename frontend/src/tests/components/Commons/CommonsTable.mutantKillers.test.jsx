import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import CommonsTable from "main/components/Commons/CommonsTable";
import { QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { createTestQueryClient } from "tests/utils/testQueryClient";

// mock backend mutation used by the component to avoid network calls
vi.mock("main/utils/useBackend", () => ({
  useBackendMutation: () => ({ mutate: vi.fn() }),
}));

const adminUser = { loggedIn: true, root: { rolesList: ["ROLE_ADMIN"] } };

function renderWithProviders(ui) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CommonsTable targeted mutant killers", () => {
  test("default sort select value is commons.id and toggle text changes", async () => {
    const commons = [
      { commons: { id: 2, name: "B" }, totalCows: 0 },
      { commons: { id: 1, name: "A" }, totalCows: 0 },
    ];

    renderWithProviders(
      <CommonsTable commons={commons} currentUser={{ roles: [] }} />,
    );

    const select = screen.getByTestId("CommonsTable-sort-select");
    expect(select).toHaveValue("commons.id");

    const toggle = screen.getByTestId("CommonsTable-sort-direction-toggle");
    // Default text from initial state
    expect(toggle).toHaveTextContent(/Ascending/);
    await userEvent.click(toggle);
    expect(toggle).toHaveTextContent(/Descending/);
    await userEvent.click(toggle);
    expect(toggle).toHaveTextContent(/Ascending/);
  });

  test("required data-testids exist for name field, summary and actions (admin)", () => {
    const commons = [
      {
        commons: {
          id: 42,
          name: "FarmX",
          cowPrice: 10,
          milkPrice: 5,
          startingBalance: 100,
          startingDate: "2024-01-01",
          lastDate: "2024-02-01",
          degradationRate: 0.1,
          capacityPerUser: 2,
          carryingCapacity: 50,
          showLeaderboard: true,
          showChat: false,
        },
        totalCows: 7,
      },
    ];

    renderWithProviders(
      <CommonsTable commons={commons} currentUser={adminUser} />,
    );

    expect(
      screen.getByTestId("CommonsTable-card-0-field-commons.name"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("CommonsTable-card-0-summary"),
    ).toBeInTheDocument();
    // actions only render for admin
    expect(
      screen.getByTestId("CommonsTable-card-0-actions"),
    ).toBeInTheDocument();
  });

  test("string sorting by Name asc/desc works deterministically", async () => {
    const commons = [
      { commons: { id: 1, name: "Charlie" }, totalCows: 0 },
      { commons: { id: 2, name: "Alpha" }, totalCows: 0 },
      { commons: { id: 3, name: "Bravo" }, totalCows: 0 },
    ];

    renderWithProviders(
      <CommonsTable commons={commons} currentUser={{ roles: [] }} />,
    );

    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, "commons.name");

    const namesAsc = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((n) => n.textContent);
    expect(namesAsc).toEqual(["Alpha", "Bravo", "Charlie"]);

    await userEvent.click(
      screen.getByTestId("CommonsTable-sort-direction-toggle"),
    );

    const namesDesc = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((n) => n.textContent);
    expect(namesDesc).toEqual(["Charlie", "Bravo", "Alpha"]);
  });
});
