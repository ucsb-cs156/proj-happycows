import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect } from "vitest";
import CommonsTable from "main/components/Commons/CommonsTable";
import { QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { createTestQueryClient } from "tests/utils/testQueryClient";

describe("CommonsTable coverage sweeper", () => {
  function renderTable(commons, currentUser = { roles: [] }) {
    const queryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsTable commons={commons} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  test("iterates all sort fields and directions without crashing", async () => {
    const commons = [
      {
        commons: {
          id: 1,
          name: "Alpha",
          cowPrice: "10",
          milkPrice: "5",
          startingBalance: "100",
          startingDate: "2020-01-01",
          lastDate: "2020-12-31",
          degradationRate: "0.1",
          showLeaderboard: true,
          showChat: false,
          capacityPerUser: "2",
          carryingCapacity: "50",
        },
        totalCows: 3,
        effectiveCapacity: null,
      },
      {
        commons: {
          id: 2,
          name: "Beta",
          cowPrice: "",
          milkPrice: "",
          startingBalance: null,
          startingDate: null,
          lastDate: null,
          degradationRate: null,
          showLeaderboard: null,
          showChat: null,
          capacityPerUser: null,
          carryingCapacity: null,
        },
        totalCows: null,
        effectiveCapacity: 42,
      },
    ];

    renderTable(commons);

    const select = screen.getByTestId("CommonsTable-sort-select");
    const toggle = screen.getByTestId("CommonsTable-sort-direction-toggle");

    // iterate over all options
    for (const option of Array.from(select.options)) {
      await userEvent.selectOptions(select, option.value);
      // toggle both directions
      await userEvent.click(toggle);
      await userEvent.click(toggle);
    }

    // ensure cards present and count unchanged
    const cards = screen.getAllByTestId(/CommonsTable-card-\d+-name/);
    expect(cards.length).toBe(2);
  });
});
