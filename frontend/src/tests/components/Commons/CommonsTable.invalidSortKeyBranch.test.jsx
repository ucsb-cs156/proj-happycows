import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import CommonsTable from "main/components/Commons/CommonsTable";
import { QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import { createTestQueryClient } from "tests/utils/testQueryClient";

// mock backend mutation used by the component to avoid network calls, but keep other exports intact
vi.mock("main/utils/useBackend", async () => {
  const actual = await vi.importActual("main/utils/useBackend");
  return {
    __esModule: true,
    ...actual,
    useBackendMutation: () => ({ mutate: vi.fn() }),
  };
});

describe("CommonsTable validSortKey fallback branch", () => {
  const commons = [
    {
      commons: {
        id: 2,
        name: "B",
        cowPrice: 10,
        milkPrice: 1,
        startingBalance: 100,
        startingDate: "2024-01-02T00:00:00",
        lastDate: "2024-01-03T00:00:00",
        degradationRate: 0.01,
        capacityPerUser: 5,
        carryingCapacity: 50,
        showLeaderboard: true,
        showChat: false,
      },
      totalCows: 3,
      effectiveCapacity: null,
    },
    {
      commons: {
        id: 1,
        name: "A",
        cowPrice: 12,
        milkPrice: 2,
        startingBalance: 200,
        startingDate: "2024-01-01T00:00:00",
        lastDate: "2024-01-02T00:00:00",
        degradationRate: 0.02,
        capacityPerUser: 6,
        carryingCapacity: 60,
        showLeaderboard: false,
        showChat: true,
      },
      totalCows: 4,
      effectiveCapacity: null,
    },
  ];

  test("changing select to invalid key keeps validSortKey fallback (commons.id) selected", async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsTable commons={commons} currentUser={{ roles: [] }} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const select = await screen.findByTestId("CommonsTable-sort-select");

    // Sanity: initial value should be commons.id
    expect(select).toHaveValue("commons.id");

    // Fire change with an invalid key not present in options; component should fallback to commons.id via validSortKey
    fireEvent.change(select, { target: { value: "not-a-real-key" } });
    expect(select).toHaveValue("commons.id");
  });
});
