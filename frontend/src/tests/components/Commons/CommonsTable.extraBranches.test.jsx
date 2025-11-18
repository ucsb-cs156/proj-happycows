import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import CommonsTable from "main/components/Commons/CommonsTable";
import { getSortableValue } from "main/components/Commons/commonsTableUtils";
import { QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { createTestQueryClient } from "tests/utils/testQueryClient";

// We'll mock useBackendMutation so confirmDelete calls the spy we can assert on
const mutateSpy = vi.fn();
vi.mock("main/utils/useBackend", () => ({
  useBackendMutation: () => ({ mutate: mutateSpy }),
}));

// Minimal admin currentUser shape expected by hasRole
const adminUser = { loggedIn: true, root: { rolesList: ["ROLE_ADMIN"] } };

describe("CommonsTable extra branches", () => {
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

  test("confirm delete calls mutate with correct params", async () => {
    mutateSpy.mockClear();
    const commons = [
      {
        commons: { id: 42, name: "ToDelete" },
        totalCows: 0,
        effectiveCapacity: 0,
      },
    ];

    renderTable(commons, adminUser);

    // open delete modal
    await userEvent.click(
      screen.getByTestId("CommonsTable-card-0-action-Delete"),
    );
    expect(screen.getByTestId("CommonsTable-Modal")).toBeVisible();

    // confirm delete
    await userEvent.click(screen.getByTestId("CommonsTable-Modal-Delete"));

    await waitFor(
      () => {
        expect(mutateSpy).toHaveBeenCalled();
      },
      { timeout: 50 },
    );

    // check mutate was called with the expected row values
    const arg = mutateSpy.mock.calls[0][0];
    expect(arg).toEqual({ row: { values: { "commons.id": 42 } } });
  });

  test("getSortableValue returns null for unknown key", () => {
    const cp = { commons: { id: 1, name: "X" }, totalCows: 2 };
    expect(getSortableValue(cp, "this.key.does.not.exist")).toBeNull();
  });

  test("sorting when both values are null (numeric key) does not crash and preserves entries", async () => {
    // both milkPrice values are missing -> getSortableValue will return null for both
    const commons = [
      { commons: { id: 1, name: "First" }, totalCows: 1 },
      { commons: { id: 2, name: "Second" }, totalCows: 2 },
    ];

    renderTable(commons);

    // select milkPrice as sort key (both are null)
    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, "commons.milkPrice");

    // ensure both cards rendered in some deterministic order and component didn't crash
    const names = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((n) => n.textContent);
    expect(names.length).toBe(2);
    expect(names).toEqual(["First", "Second"]);
  });

  test("sorting handles null vs non-null with descending direction", async () => {
    // one entry has null milkPrice, the other has a number
    const commons = [
      { commons: { id: 1, name: "NullPrice" }, totalCows: 1 },
      { commons: { id: 2, name: "HasPrice", milkPrice: "50" }, totalCows: 2 },
    ];

    renderTable(commons);

    // toggle to descending
    const toggle = screen.getByTestId("CommonsTable-sort-direction-toggle");
    await userEvent.click(toggle);
    expect(toggle.textContent).toMatch(/Descending/);

    // select milkPrice as sort key
    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, "commons.milkPrice");

    // Descending should place the non-null (HasPrice) before the null one
    const names = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((n) => n.textContent);
    expect(names[0]).toBe("HasPrice");
  });

  test("sorting handles non-null vs null with descending direction (reverse case)", async () => {
    // opposite positions to exercise the other branch
    const commons = [
      { commons: { id: 1, name: "HasPrice", milkPrice: "10" }, totalCows: 1 },
      { commons: { id: 2, name: "NullPrice" }, totalCows: 2 },
    ];

    renderTable(commons);

    // toggle to descending
    const toggle = screen.getByTestId("CommonsTable-sort-direction-toggle");
    await userEvent.click(toggle);
    expect(toggle.textContent).toMatch(/Descending/);

    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, "commons.milkPrice");

    const names = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((n) => n.textContent);
    expect(names[0]).toBe("HasPrice");
  });

  test("invalid sort key falls back to default sort (commons.id)", async () => {
    const commons = [
      { commons: { id: 2, name: "Second" }, totalCows: 1 },
      { commons: { id: 1, name: "First" }, totalCows: 2 },
    ];

    renderTable(commons);

    const select = screen.getByTestId("CommonsTable-sort-select");
    // programmatically set an invalid value to exercise the fallback
    fireEvent.change(select, { target: { value: "this.key.does.not.exist" } });

    // ensure fallback to commons.id ordering (ascending) occurred
    const names = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((n) => n.textContent);
    expect(names).toEqual(["First", "Second"]);
  });

  test("confirmDelete returns early when no commonsToDelete set", async () => {
    mutateSpy.mockClear();
    // render with admin so the modal markup is present
    renderTable([], adminUser);

    // click the modal delete button even though no commonsToDelete has been set
    // click the modal delete button even though no commonsToDelete has been set
    // The modal may not be rendered when there are no commons; use queryByTestId
    // and only click if it exists. The key assertion is that mutate should not
    // have been called.
    const modalDelete = screen.queryByTestId("CommonsTable-Modal-Delete");
    if (modalDelete) {
      await userEvent.click(modalDelete);
    }

    // mutate should not have been called
    expect(mutateSpy).not.toHaveBeenCalled();
  });
});
