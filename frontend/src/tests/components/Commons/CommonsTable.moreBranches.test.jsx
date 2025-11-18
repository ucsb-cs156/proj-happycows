import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommonsTable from "main/components/Commons/CommonsTable";
import { QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { createTestQueryClient } from "tests/utils/testQueryClient";

// mock backend mutation used by the component to avoid network calls
vi.mock("main/utils/useBackend", () => ({
  useBackendMutation: () => ({ mutate: vi.fn() }),
}));

describe("CommonsTable additional sorting branches", () => {
  test("numeric equal values hit the return 0 branch", async () => {
    const commons = [
      { commons: { id: 1, name: "A", milkPrice: "5" }, totalCows: "2" },
      { commons: { id: 2, name: "B", milkPrice: "5" }, totalCows: "3" },
      { commons: { id: 3, name: "C", milkPrice: "10" }, totalCows: "1" },
    ];

    const currentUser = { roles: [] };
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsTable commons={commons} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // select milkPrice as sort key
    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, "commons.milkPrice");

    // Ascending should have the two equal '5' items first (A then B) then C
    const names = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((n) => n.textContent);
    expect(names.slice(0, 2)).toEqual(["A", "B"]);
  });

  test("effectiveCapacity uses explicit vs computed values", async () => {
    // first commons has explicit effectiveCapacity 50
    // second has capacityPerUser 10 and totalUsers 3 -> computed 30
    // third has null effectiveCapacity and no capacityPerUser -> treated as null
    const commons = [
      {
        commons: { id: 1, name: "Exp", milkPrice: "1", capacityPerUser: null },
        totalCows: "2",
        effectiveCapacity: 50,
      },
      {
        commons: { id: 2, name: "Comp", milkPrice: "2", capacityPerUser: 10 },
        totalCows: "3",
        commonsPlusExtra: true,
      },
      { commons: { id: 3, name: "Null", milkPrice: "3" }, totalCows: "1" },
    ];

    // To ensure computeEffectiveCapacity can use totalUsers, structure entries as commonsPlus objects
    const commonsPlus = [
      {
        commons: commons[0].commons,
        totalCows: commons[0].totalCows,
        effectiveCapacity: 50,
      },
      {
        commons: { ...commons[1].commons },
        totalUsers: 3,
        totalCows: commons[1].totalCows,
      },
      { commons: commons[2].commons, totalCows: commons[2].totalCows },
    ];

    const currentUser = { roles: [] };
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsTable commons={commonsPlus} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // select effectiveCapacity as sort key
    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, "effectiveCapacity");

    // Ascending: Null (treated as null -> placed after non-null), so expected order: Comp (30), Exp (50), Null
    const names = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((n) => n.textContent);
    expect(names).toEqual(["Comp", "Exp", "Null"]);
  });
});
