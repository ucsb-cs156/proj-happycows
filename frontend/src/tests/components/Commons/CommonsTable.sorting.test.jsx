import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommonsTable from "main/components/Commons/CommonsTable";
import { getSortableValue } from "main/components/Commons/commonsTableUtils";
import { QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { createTestQueryClient } from "tests/utils/testQueryClient";

// mock backend mutation used by the component to avoid network calls
vi.mock("main/utils/useBackend", () => ({
  useBackendMutation: () => ({ mutate: vi.fn() }),
}));

describe("CommonsTable sorting and extra getSortableValue branches", () => {
  test("getSortableValue covers milkPrice, startingBalance, lastDate, degradationRate", () => {
    const row = {
      commons: {
        milkPrice: "2.5",
        startingBalance: "1000",
        lastDate: "2023-01-02T03:04:05Z",
        degradationRate: "0.123",
      },
      totalCows: "1",
    };

    expect(getSortableValue(row, "commons.milkPrice")).toBe(2.5);
    expect(getSortableValue(row, "commons.startingBalance")).toBe(1000);
    // dates should return the string as-is (first 10 handled in formatDate)
    expect(getSortableValue(row, "commons.lastDate")).toBe(
      "2023-01-02T03:04:05Z",
    );
    expect(getSortableValue(row, "commons.degradationRate")).toBe(0.123);
  });

  test("component sorting handles null vs non-null for defaults (no crash)", async () => {
    // Use default sortKey (commons.id) and include undefined ids so comparator
    // will exercise the branches for aVal === null / bVal === null
    const commons = [
      {
        commons: { /* id missing */ name: null, cowPrice: "5" },
        totalCows: "2",
      },
      { commons: { id: 2, name: "Bravo", cowPrice: "10" }, totalCows: "3" },
      {
        commons: { /* id missing */ name: null, cowPrice: "" },
        totalCows: "1",
      },
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

    // Ensure the component rendered and cards exist; comparator branches are
    // executed during rendering of sortedCommons (no explicit assertion on
    // order required here).
    expect(screen.getByTestId("CommonsTable-card-0")).toBeInTheDocument();
    expect(screen.getByTestId("CommonsTable-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("CommonsTable-card-2")).toBeInTheDocument();
    // Ensure the named card content exists somewhere
    expect(screen.getByText("Bravo")).toBeInTheDocument();
  });

  test("component numeric sorting by milkPrice ascending and descending", async () => {
    const commons = [
      { commons: { id: 1, name: "Alpha", milkPrice: "5" }, totalCows: "2" },
      { commons: { id: 2, name: "Bravo", milkPrice: "10" }, totalCows: "3" },
      { commons: { id: 3, name: "Charlie", milkPrice: 7 }, totalCows: "1" },
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

    // default direction is asc -> expect Alpha (5), Charlie (7), Bravo (10)
    const names = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((n) => n.textContent);
    expect(names).toEqual(["Alpha", "Charlie", "Bravo"]);

    // toggle direction to desc
    await userEvent.click(
      screen.getByTestId("CommonsTable-sort-direction-toggle"),
    );

    const namesDesc = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((n) => n.textContent);
    expect(namesDesc).toEqual(["Bravo", "Charlie", "Alpha"]);
  });
});
