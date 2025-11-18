import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import CommonsTable from "main/components/Commons/CommonsTable";
import { createTestQueryClient } from "src/tests/utils/testQueryClient";

vi.mock("main/utils/useBackend", () => ({
  useBackendMutation: () => ({ mutate: vi.fn() }),
}));

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

describe("CommonsTable comparator edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("default id sorting pushes undefined ids to the end for both directions", async () => {
    const commons = [
      { commons: { id: undefined, name: "NoId" }, totalCows: 0 },
      { commons: { id: 2, name: "Two" }, totalCows: 0 },
      { commons: { id: 1, name: "One" }, totalCows: 0 },
    ];

    renderTable(commons);

    const select = screen.getByTestId("CommonsTable-sort-select");
    expect(select).toHaveAttribute("data-current-sort", "commons.id");
    expect(screen.getByRole("option", { name: "Eff Cap" })).toBeInTheDocument();

    const idsAsc = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((node) => node.textContent);
    expect(idsAsc).toEqual(["One", "Two", "NoId"]);

    const toggle = screen.getByTestId("CommonsTable-sort-direction-toggle");
    expect(toggle).toHaveAttribute("data-current-direction", "asc");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("data-current-direction", "desc");

    const idsDesc = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((node) => node.textContent);
    expect(idsDesc).toEqual(["Two", "One", "NoId"]);
  });

  test("string comparator handles mixed string and number names", async () => {
    const commons = [
      { commons: { id: 1, name: "Alpha" }, totalCows: 0 },
      { commons: { id: 2, name: 123 }, totalCows: 0 },
      { commons: { id: 3, name: "Zulu" }, totalCows: 0 },
    ];

    renderTable(commons);

    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, "commons.name");

    const namesAsc = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((node) => node.textContent);
    expect(namesAsc).toEqual(["123", "Alpha", "Zulu"]);
  });

  test("numeric comparator treats NaN as a fallback and keeps NaN entries last", async () => {
    const commons = [
      {
        commons: { id: 1, name: "NaN Entry", cowPrice: Number.NaN },
        totalCows: 0,
      },
      { commons: { id: 2, name: "Five", cowPrice: 5 }, totalCows: 0 },
      { commons: { id: 3, name: "Ten", cowPrice: 10 }, totalCows: 0 },
    ];

    renderTable(commons);

    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, "commons.cowPrice");

    const namesAsc = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((node) => node.textContent);
    expect(namesAsc).toEqual(["Five", "Ten", "NaN Entry"]);
  });

  test("entries with identical numeric values preserve original order", async () => {
    const commons = [
      { commons: { id: 1, name: "Alpha", cowPrice: 5 }, totalCows: 0 },
      { commons: { id: 2, name: "Beta", cowPrice: 5 }, totalCows: 0 },
      { commons: { id: 3, name: "Gamma", cowPrice: 7 }, totalCows: 0 },
    ];

    renderTable(commons);

    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, "commons.cowPrice");

    const namesAsc = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((node) => node.textContent);
    expect(namesAsc).toEqual(["Alpha", "Beta", "Gamma"]);
  });
});
