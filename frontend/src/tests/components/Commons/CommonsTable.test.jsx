import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import CommonsTable from "main/components/Commons/CommonsTable";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import commonsPlusFixtures from "fixtures/commonsPlusFixtures";
import { createTestQueryClient } from "tests/utils/testQueryClient";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/commonsUtils";
import {
  computeEffectiveCapacity,
  createCommonsComparator,
  formatBoolean,
  formatDate,
  formatPlain,
  getSortableValue,
} from "main/components/Commons/commonsTableUtils";

const mutateSpy = vi.fn();

vi.mock("main/utils/useBackend", () => ({
  useBackendMutation: (...args) =>
    globalThis.__useBackendMutationMock__(...args),
}));

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

beforeEach(() => {
  mutateSpy.mockReset();
  // default runtime bridge for the mocked useBackendMutation (vi.fn so we can assert calls)
  globalThis.__useBackendMutationMock__ = vi.fn(() => ({ mutate: mutateSpy }));
});

const renderCommonsTable = (props) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CommonsTable {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

const adminUser = { loggedIn: true, root: { rolesList: ["ROLE_ADMIN"] } };

describe("commonsTableUtils helpers", () => {
  test("formatPlain returns dash for null/empty/undefined", () => {
    expect(formatPlain(null)).toBe("—");
    expect(formatPlain(undefined)).toBe("—");
    expect(formatPlain("")).toBe("—");
  });

  test("formatPlain returns string for non-empty values", () => {
    expect(formatPlain(123)).toBe("123");
    expect(formatPlain("abc")).toBe("abc");
  });

  test("getSortableValue handles null row", () => {
    expect(getSortableValue(null, "commons.id")).toBeNull();
  });

  test("getSortableValue returns id and name", () => {
    const row = { commons: { id: 7, name: "Seven" } };
    expect(getSortableValue(row, "commons.id")).toBe(7);
    expect(getSortableValue(row, "commons.name")).toBe("Seven");
  });

  test("getSortableValue parses numeric fields and handles invalid values", () => {
    const row = {
      commons: {
        cowPrice: "5.5",
        milkPrice: "2.5",
        startingBalance: "1000",
        capacityPerUser: "notanumber",
        degradationRate: "0.123",
      },
      totalCows: "3",
    };

    expect(getSortableValue(row, "commons.cowPrice")).toBe(5.5);
    expect(getSortableValue(row, "commons.milkPrice")).toBe(2.5);
    expect(getSortableValue(row, "commons.startingBalance")).toBe(1000);
    expect(getSortableValue(row, "commons.capacityPerUser")).toBeNull();
    expect(getSortableValue(row, "commons.degradationRate")).toBe(0.123);
    expect(getSortableValue(row, "totalCows")).toBe(3);
  });

  test("getSortableValue handles date and boolean fields", () => {
    const row = {
      commons: {
        startingDate: "2022-12-12",
        lastDate: "2023-01-02T03:04:05Z",
        showLeaderboard: true,
        showChat: false,
      },
    };

    expect(getSortableValue(row, "commons.startingDate")).toBe("2022-12-12");
    expect(getSortableValue(row, "commons.lastDate")).toBe(
      "2023-01-02T03:04:05Z",
    );
    expect(getSortableValue(row, "commons.showLeaderboard")).toBe(true);
    expect(getSortableValue(row, "commons.showChat")).toBe(false);
  });

  test("getSortableValue effectiveCapacity uses explicit value when finite", () => {
    const row = {
      effectiveCapacity: 42,
      commons: { capacityPerUser: "2" },
      totalUsers: "10",
    };

    expect(getSortableValue(row, "effectiveCapacity")).toBe(42);
  });

  test("getSortableValue effectiveCapacity falls back to computed value", () => {
    const row = {
      effectiveCapacity: undefined,
      commons: { capacityPerUser: "3" },
      totalUsers: "4",
    };

    expect(getSortableValue(row, "effectiveCapacity")).toBe(12);
  });

  test("getSortableValue returns null for unknown keys", () => {
    const row = { commons: { id: 1 } };
    expect(getSortableValue(row, "unknown.key")).toBeNull();
  });

  test("getSortableValue only supports id and name when provided", () => {
    expect(getSortableValue({ commons: { id: 1 } }, "commons.id")).toBe(1);
    expect(getSortableValue({ commons: { name: "A" } }, "commons.name")).toBe(
      "A",
    );
    expect(getSortableValue({ commons: {} }, "commons.cowPrice")).toBeNull();
    expect(getSortableValue({ commons: {} }, "notAKey")).toBeNull();
  });
});

describe("commonsTableUtils additional coverage", () => {
  test("formatDate handles empty inputs and trims ISO strings", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("")).toBe("—");
    expect(formatDate("2022-12-12T05:06:07Z")).toBe("2022-12-12");
  });

  test("formatBoolean mirrors formatPlain semantics for nullish inputs", () => {
    expect(formatBoolean(null)).toBe("—");
    expect(formatBoolean(undefined)).toBe("—");
    expect(formatBoolean("")).toBe("—");
    expect(formatBoolean(true)).toBe("true");
    expect(formatBoolean(false)).toBe("false");
  });

  test("computeEffectiveCapacity covers explicit, computed, and null branches", () => {
    expect(
      computeEffectiveCapacity({
        effectiveCapacity: 42,
        commons: { capacityPerUser: "2" },
        totalUsers: "10",
      }),
    ).toBe(42);

    expect(
      computeEffectiveCapacity({
        effectiveCapacity: undefined,
        commons: { capacityPerUser: "3" },
        totalUsers: "4",
      }),
    ).toBe(12);

    expect(
      computeEffectiveCapacity({
        effectiveCapacity: undefined,
        commons: { capacityPerUser: null },
        totalUsers: null,
      }),
    ).toBeNull();

    expect(
      computeEffectiveCapacity({
        effectiveCapacity: null,
        commons: { capacityPerUser: null },
        totalUsers: 5,
      }),
    ).toBeNull();
    expect(
      computeEffectiveCapacity({
        effectiveCapacity: null,
        commons: { capacityPerUser: 3 },
        totalUsers: null,
      }),
    ).toBeNull();
  });

  test("getSortableValue handles exhaustive numeric, boolean, and date branches", () => {
    const base = {
      commons: {
        id: 5,
        name: "Farm",
        milkPrice: "34",
        startingDate: "2020-01-02T00:00:00Z",
        lastDate: null,
        showLeaderboard: true,
        showChat: false,
        carryingCapacity: "10",
        capacityPerUser: "7",
      },
      totalCows: "7",
    };

    expect(getSortableValue(base, "commons.id")).toBe(5);
    expect(getSortableValue(base, "commons.name")).toBe("Farm");
    expect(getSortableValue(base, "commons.milkPrice")).toBe(34);
    expect(getSortableValue(base, "commons.startingDate")).toBe(
      "2020-01-02T00:00:00Z",
    );
    expect(getSortableValue(base, "commons.lastDate")).toBe("");
    expect(getSortableValue(base, "commons.showLeaderboard")).toBe(true);
    expect(getSortableValue(base, "commons.showChat")).toBe(false);
    expect(getSortableValue(base, "commons.carryingCapacity")).toBe(10);
    expect(getSortableValue(base, "commons.capacityPerUser")).toBe(7);
    expect(getSortableValue(base, "totalCows")).toBe(7);
  });

  test("getSortableValue handles falsy commons object safely", () => {
    const commonsPlus = {};
    const keysExpectNull = [
      "commons.id",
      "commons.cowPrice",
      "commons.milkPrice",
      "commons.startingBalance",
      "commons.degradationRate",
      "commons.showLeaderboard",
      "commons.showChat",
      "commons.capacityPerUser",
      "commons.carryingCapacity",
      "totalCows",
    ];
    keysExpectNull.forEach((key) => {
      expect(getSortableValue(commonsPlus, key)).toBeNull();
    });

    const keysExpectEmpty = [
      "commons.name",
      "commons.startingDate",
      "commons.lastDate",
    ];
    keysExpectEmpty.forEach((key) => {
      expect(getSortableValue(commonsPlus, key)).toBe("");
    });
  });

  test("getSortableValue normalizes effectiveCapacity edge cases", () => {
    expect(
      getSortableValue({ effectiveCapacity: "" }, "effectiveCapacity"),
    ).toBeNull();
    expect(
      getSortableValue({ effectiveCapacity: "abc" }, "effectiveCapacity"),
    ).toBeNull();
    expect(
      getSortableValue({ effectiveCapacity: null }, "effectiveCapacity"),
    ).toBeNull();
  });

  test("computeEffectiveCapacity returns null when capacityPerUser present but totalUsers undefined", () => {
    expect(
      computeEffectiveCapacity({
        effectiveCapacity: undefined,
        commons: { capacityPerUser: 3 },
        totalUsers: undefined,
      }),
    ).toBeNull();

    expect(
      computeEffectiveCapacity({
        effectiveCapacity: undefined,
        commons: null,
        totalUsers: 5,
      }),
    ).toBeNull();
  });

  test("createCommonsComparator handles numeric, string, and missing values", () => {
    const a = { commons: { cowPrice: 5, name: "Alpha", id: 1 }, totalCows: 1 };
    const b = { commons: { cowPrice: 10, name: "Zulu", id: 2 }, totalCows: 2 };
    const missing = { commons: { id: 3 }, totalCows: null };

    const numericAsc = createCommonsComparator("commons.cowPrice", "asc");
    expect(numericAsc(a, b)).toBeLessThan(0);
    const numericDesc = createCommonsComparator("commons.cowPrice", "desc");
    expect(numericDesc(a, b)).toBeGreaterThan(0);
    expect(numericAsc(a, a)).toBe(0);

    const stringAsc = createCommonsComparator("commons.name", "asc");
    expect(stringAsc(a, b)).toBeLessThan(0);
    const stringDesc = createCommonsComparator("commons.name", "desc");
    expect(stringDesc(a, b)).toBeGreaterThan(0);

    const missingComparator = createCommonsComparator("totalCows", "asc");
    expect(missingComparator(missing, a)).toBe(1);
    expect(missingComparator(a, missing)).toBe(-1);

    const missingDesc = createCommonsComparator("totalCows", "desc");
    expect(missingDesc(missing, a)).toBe(1);
    expect(missingDesc(a, missing)).toBe(-1);

    const defaultDirection = createCommonsComparator("commons.id");
    expect(defaultDirection(a, b)).toBeLessThan(0);

    expect(() => createCommonsComparator("commons.id", "zzz")).toThrow(
      /Invalid sort direction/,
    );

    // explicit numeric-null handling: both null numeric values should compare equal (return 0)
    const aNull = { commons: { cowPrice: null, id: 1 }, totalCows: null };
    const bNull = { commons: { cowPrice: null, id: 2 }, totalCows: null };
    const numericNullComparator = createCommonsComparator(
      "commons.cowPrice",
      "asc",
    );
    expect(numericNullComparator(aNull, bNull)).toBe(0);
  });
});

describe("CommonsTable component", () => {
  let mockMutate;

  beforeEach(() => {
    mockMutate = vi.fn();
    globalThis.__useBackendMutationMock__ = vi.fn(() => ({
      mutate: mockMutate,
    }));
    mockedNavigate.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders without crashing for empty table with user not logged in", () => {
    renderCommonsTable({ commons: [], currentUser: null });
  });

  test("renders without crashing for empty table for ordinary user", () => {
    renderCommonsTable({
      commons: [],
      currentUser: currentUserFixtures.userOnly,
    });
  });

  test("renders without crashing for empty table for admin", () => {
    renderCommonsTable({
      commons: [],
      currentUser: currentUserFixtures.adminUser,
    });
  });

  test("Displays expected commons information and actions for adminUser", () => {
    renderCommonsTable({
      commons: commonsPlusFixtures.threeCommonsPlus,
      currentUser: currentUserFixtures.adminUser,
    });

    const cards = commonsPlusFixtures.threeCommonsPlus.map((_, index) =>
      screen.getByTestId(`CommonsTable-card-${index}`),
    );
    expect(cards.length).toEqual(commonsPlusFixtures.threeCommonsPlus.length);

    expect(
      screen.getByTestId("CommonsTable-cell-row-0-col-commons.id"),
    ).toHaveTextContent("1");
    expect(
      screen.getByTestId("CommonsTable-cell-row-1-col-commons.id"),
    ).toHaveTextContent("2");

    expect(screen.getByTestId("CommonsTable-card-1-name")).toHaveTextContent(
      "Com2",
    );
    expect(
      screen.getByTestId("CommonsTable-cell-row-1-col-commons.cowPrice"),
    ).toHaveTextContent("1");
    expect(
      screen.getByTestId("CommonsTable-cell-row-1-col-commons.milkPrice"),
    ).toHaveTextContent("2");
    expect(
      screen.getByTestId("CommonsTable-cell-row-1-col-commons.degradationRate"),
    ).toHaveTextContent("0.01");
    expect(
      screen.getByTestId("CommonsTable-cell-row-1-col-commons.capacityPerUser"),
    ).toHaveTextContent("5");
    expect(
      screen.getByTestId("CommonsTable-cell-row-1-col-commons.carryingCapacity"),
    ).toHaveTextContent("42");
    expect(
      screen.getByTestId("CommonsTable-cell-row-1-col-commons.startingBalance"),
    ).toHaveTextContent("10");
    expect(
      screen.getByTestId("CommonsTable-cell-row-1-col-commons.startingDate"),
    ).toHaveTextContent("2022-11-22");
    expect(
      screen.getByTestId("CommonsTable-cell-row-1-col-commons.lastDate"),
    ).toHaveTextContent("2022-11-22");
    expect(
      screen.getByTestId("CommonsTable-cell-row-1-col-commons.showLeaderboard"),
    ).toHaveTextContent("true");
    expect(
      screen.getByTestId("CommonsTable-cell-row-1-col-commons.showChat"),
    ).toHaveTextContent("true");
    expect(
      screen.getByTestId("CommonsTable-cell-row-1-col-totalCows"),
    ).toHaveTextContent("0");
    expect(
      screen.getByTestId("CommonsTable-card-1-totalCows"),
    ).toHaveTextContent("Tot Cows: 0");
    expect(
      screen.getByTestId("CommonsTable-card-1-effectiveCapacity"),
    ).toHaveTextContent("Eff Cap: 42");
    expect(
      screen.getByTestId("CommonsTable-cell-row-1-col-effectiveCapacity"),
    ).toHaveTextContent("42");

    expect(screen.getByTestId("CommonsTable-cell-row-0-col-Edit")).toHaveClass(
      "btn-primary",
    );
    expect(screen.getByTestId("CommonsTable-cell-row-0-col-Delete")).toHaveClass(
      "btn-danger",
    );
    expect(
      screen.getByTestId("CommonsTable-cell-row-0-col-Leaderboard"),
    ).toHaveClass("btn-secondary");
    expect(
      screen.getByTestId("CommonsTable-cell-row-0-col-StatsCSV"),
    ).toHaveClass("btn-success");
    expect(
      screen.getByTestId("CommonsTable-cell-row-0-col-Announcements"),
    ).toHaveClass("btn-info");
  });

  test("allows sorting by Name descending", () => {
    renderCommonsTable({
      commons: commonsPlusFixtures.threeCommonsPlus,
      currentUser: currentUserFixtures.adminUser,
    });

    const sortSelect = screen.getByTestId("CommonsTable-sort-select");
    fireEvent.change(sortSelect, { target: { value: "commons.name" } });

    const directionToggle = screen.getByTestId(
      "CommonsTable-sort-direction-toggle",
    );
    fireEvent.click(directionToggle);

    expect(directionToggle).toHaveTextContent("Descending");
    expect(
      screen.getByTestId("CommonsTable-cell-row-0-col-commons.id"),
    ).toHaveTextContent("3");
  });

  test("component sorting handles null vs non-null for defaults", () => {
    const commons = [
      {
        commons: { name: null, cowPrice: "5" },
        totalCows: "2",
      },
      { commons: { id: 2, name: "Bravo", cowPrice: "10" }, totalCows: "3" },
      {
        commons: { name: null, cowPrice: "" },
        totalCows: "1",
      },
    ];

    renderCommonsTable({ commons, currentUser: { roles: [] } });

    expect(screen.getByTestId("CommonsTable-card-0")).toBeInTheDocument();
    expect(screen.getByTestId("CommonsTable-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("CommonsTable-card-2")).toBeInTheDocument();
    expect(screen.getByText("Bravo")).toBeInTheDocument();
  });

  test("component numeric sorting by milkPrice ascending and descending", async () => {
    const commons = [
      { commons: { id: 1, name: "Alpha", milkPrice: "5" }, totalCows: "2" },
      { commons: { id: 2, name: "Bravo", milkPrice: "10" }, totalCows: "3" },
      { commons: { id: 3, name: "Charlie", milkPrice: 7 }, totalCows: "1" },
    ];

    renderCommonsTable({ commons, currentUser: { roles: [] } });

    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, "commons.milkPrice");

    const namesAsc = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((n) => n.textContent);
    expect(namesAsc).toEqual(["Alpha", "Charlie", "Bravo"]);

    await userEvent.click(
      screen.getByTestId("CommonsTable-sort-direction-toggle"),
    );

    const namesDesc = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((n) => n.textContent);
    expect(namesDesc).toEqual(["Bravo", "Charlie", "Alpha"]);
  });

  test("Clicking Delete button opens the modal for adminUser", () => {
    renderCommonsTable({
      commons: commonsPlusFixtures.threeCommonsPlus,
      currentUser: currentUserFixtures.adminUser,
    });

    fireEvent.click(screen.getByTestId("CommonsTable-cell-row-0-col-Delete"));

    expect(screen.getByTestId("CommonsTable-Modal")).toBeInTheDocument();
  });

  test("Clicking Permanently Delete button deletes the commons", async () => {
    renderCommonsTable({
      commons: commonsPlusFixtures.threeCommonsPlus,
      currentUser: currentUserFixtures.adminUser,
    });

    fireEvent.click(screen.getByTestId("CommonsTable-cell-row-0-col-Delete"));

    const permanentlyDeleteButton = await screen.findByTestId(
      "CommonsTable-Modal-Delete",
    );
    fireEvent.click(permanentlyDeleteButton);

    await waitFor(
      () => {
        expect(globalThis.__useBackendMutationMock__).toHaveBeenCalledWith(
          cellToAxiosParamsDelete,
          { onSuccess: onDeleteSuccess },
          ["/api/commons/allplus"],
        );
      },
      { timeout: 50 },
    );

    await waitFor(
      () => {
        const modal = screen.getByTestId("CommonsTable-Modal");
        expect(modal).not.toBeVisible();
      },
      { timeout: 50 },
    );
  });

  test("Clicking Keep this Commons button cancels the deletion", async () => {
    renderCommonsTable({
      commons: commonsPlusFixtures.threeCommonsPlus,
      currentUser: currentUserFixtures.adminUser,
    });

    fireEvent.click(screen.getByTestId("CommonsTable-cell-row-0-col-Delete"));

    const cancelButton = await screen.findByTestId("CommonsTable-Modal-Cancel");
    fireEvent.click(cancelButton);

    await waitFor(
      () => {
        const modal = screen.getByTestId("CommonsTable-Modal");
        expect(modal).not.toBeVisible();
      },
      { timeout: 50 },
    );

    expect(mockMutate).not.toHaveBeenCalled();
  });

  test("Pressing the close button on the modal cancels the deletion", async () => {
    renderCommonsTable({
      commons: commonsPlusFixtures.threeCommonsPlus,
      currentUser: currentUserFixtures.adminUser,
    });

    fireEvent.click(screen.getByTestId("CommonsTable-cell-row-0-col-Delete"));

    expect(screen.getByTestId("CommonsTable-Modal")).toBeInTheDocument();

    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    await waitFor(
      () => {
        const modal = screen.getByTestId("CommonsTable-Modal");
        expect(modal).not.toBeVisible();
      },
      { timeout: 50 },
    );

    expect(mockMutate).not.toHaveBeenCalled();
  });

  test("renders empty alert when commons list is empty", () => {
    renderCommonsTable({ commons: [], currentUser: { roles: [] } });

    const emptyAlert = screen.getByTestId("CommonsTable-empty");
    expect(emptyAlert).toBeInTheDocument();
    expect(screen.queryByTestId(/CommonsTable-card-\d+/)).toBeNull();
  });

  test("default sort select value is commons.id and toggle text changes", async () => {
    const commons = [
      { commons: { id: 2, name: "B" }, totalCows: 0 },
      { commons: { id: 1, name: "A" }, totalCows: 0 },
    ];

    renderCommonsTable({ commons, currentUser: { roles: [] } });

    const select = screen.getByTestId("CommonsTable-sort-select");
    expect(select).toHaveValue("commons.id");

    const toggle = screen.getByTestId("CommonsTable-sort-direction-toggle");
    expect(toggle).toHaveTextContent(/Ascending/);
    await userEvent.click(toggle);
    expect(toggle).toHaveTextContent(/Descending/);
    await userEvent.click(toggle);
    expect(toggle).toHaveTextContent(/Ascending/);
  });

  test("data-current-sort reflects internal sortKey state and updates on change", async () => {
    const commons = [
      { commons: { id: 2, name: "B" }, totalCows: 0 },
      { commons: { id: 1, name: "A" }, totalCows: 0 },
    ];

    renderCommonsTable({ commons, currentUser: { roles: [] } });

    const select = screen.getByTestId("CommonsTable-sort-select");
    // data-current-sort holds the internal sortKey state (not the validated value)
    expect(select).toHaveValue("commons.id");
    expect(select.dataset.currentSort).toBe("commons.id");

    // changing the select should update internal sortKey (data-current-sort)
    fireEvent.change(select, { target: { value: "commons.name" } });
    expect(select.dataset.currentSort).toBe("commons.name");
  });

  test("modal is hidden before delete is clicked and closes on cancel", async () => {
    const commons = [
      {
        commons: { id: 10, name: "AdminCommon", capacityPerUser: 2 },
        totalCows: 0,
        effectiveCapacity: 4,
      },
    ];

    renderCommonsTable({ commons, currentUser: adminUser });

    const modalBeforeClick = screen.getByTestId("CommonsTable-Modal");
    expect(modalBeforeClick).not.toBeVisible();

    await userEvent.click(
      screen.getByTestId("CommonsTable-cell-row-0-col-Delete"),
    );
    expect(screen.getByTestId("CommonsTable-Modal")).toBeVisible();

    await userEvent.click(screen.getByTestId("CommonsTable-Modal-Cancel"));
    await waitFor(
      () => {
        const modal = screen.getByTestId("CommonsTable-Modal");
        expect(modal).not.toBeVisible();
      },
      { timeout: 50 },
    );
  });

  test("required data-testids exist for name, summary, and actions for admin", () => {
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

    renderCommonsTable({ commons, currentUser: adminUser });

    expect(
      screen.getByTestId("CommonsTable-cell-row-0-col-commons.name"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("CommonsTable-card-0-summary"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("CommonsTable-cell-row-0-cols"),
    ).toBeInTheDocument();
  });

  test("string sorting by Name asc/desc works deterministically", async () => {
    const commons = [
      { commons: { id: 1, name: "Charlie" }, totalCows: 0 },
      { commons: { id: 2, name: "Alpha" }, totalCows: 0 },
      { commons: { id: 3, name: "Bravo" }, totalCows: 0 },
    ];

    renderCommonsTable({ commons, currentUser: { roles: [] } });

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

    renderCommonsTable({ commons, currentUser: { roles: [] } });

    const select = screen.getByTestId("CommonsTable-sort-select");
    const toggle = screen.getByTestId("CommonsTable-sort-direction-toggle");

    for (const option of Array.from(select.options)) {
      await userEvent.selectOptions(select, option.value);
      await userEvent.click(toggle);
      await userEvent.click(toggle);
    }

    const cards = screen.getAllByTestId(/CommonsTable-card-\d+-name/);
    expect(cards.length).toBe(2);
  });

  test("sorting when numeric values are all null preserves order", async () => {
    const commons = [
      { commons: { id: 1, name: "First" }, totalCows: 1 },
      { commons: { id: 2, name: "Second" }, totalCows: 2 },
    ];

    renderCommonsTable({ commons, currentUser: { roles: [] } });

    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, "commons.milkPrice");

    const names = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((n) => n.textContent);
    expect(names).toEqual(["First", "Second"]);
  });

  test("numeric equal values hit comparator return zero branch", async () => {
    const commons = [
      { commons: { id: 1, name: "A", milkPrice: "5" }, totalCows: "2" },
      { commons: { id: 2, name: "B", milkPrice: "5" }, totalCows: "3" },
      { commons: { id: 3, name: "C", milkPrice: "10" }, totalCows: "1" },
    ];

    renderCommonsTable({ commons, currentUser: { roles: [] } });

    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, "commons.milkPrice");

    const names = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((n) => n.textContent);
    expect(names.slice(0, 2)).toEqual(["A", "B"]);
  });

  test("effectiveCapacity sorting distinguishes explicit, computed, and null", async () => {
    const commons = [
      {
        commons: { id: 1, name: "Exp", milkPrice: "1", capacityPerUser: null },
        totalCows: "2",
        effectiveCapacity: 50,
      },
      {
        commons: { id: 2, name: "Comp", milkPrice: "2", capacityPerUser: 10 },
        totalCows: "3",
        totalUsers: 3,
      },
      { commons: { id: 3, name: "Null", milkPrice: "3" }, totalCows: "1" },
    ];

    renderCommonsTable({ commons, currentUser: { roles: [] } });

    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, "effectiveCapacity");

    const names = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((n) => n.textContent);
    expect(names).toEqual(["Comp", "Exp", "Null"]);
  });

  test("confirm delete returns early when no commonsToDelete", async () => {
    renderCommonsTable({ commons: [], currentUser: adminUser });

    const modalDelete = screen.queryByTestId("CommonsTable-Modal-Delete");
    if (modalDelete) {
      await userEvent.click(modalDelete);
    }

    expect(mockMutate).not.toHaveBeenCalled();
  });

  test("invalid sort key falls back to default commons.id", () => {
    const commons = [
      { commons: { id: 2, name: "Second" }, totalCows: 1 },
      { commons: { id: 1, name: "First" }, totalCows: 2 },
    ];

    renderCommonsTable({ commons, currentUser: { roles: [] } });

    const select = screen.getByTestId("CommonsTable-sort-select");
    expect(select).toHaveValue("commons.id");

    fireEvent.change(select, { target: { value: "not-a-real-key" } });
    expect(select).toHaveValue("commons.id");
    // Ensure the displayed order is still sorted by the default key (commons.id)
    const firstId = screen.getByTestId("CommonsTable-cell-row-0-col-commons.id");
    expect(firstId).toHaveTextContent("1");
  });

  test("computeEffectiveCapacity handles zero values correctly", () => {
    expect(
      computeEffectiveCapacity({
        effectiveCapacity: undefined,
        commons: { capacityPerUser: 0 },
        totalUsers: 5,
      }),
    ).toBe(0);

    expect(
      computeEffectiveCapacity({
        effectiveCapacity: undefined,
        commons: { capacityPerUser: "0" },
        totalUsers: "3",
      }),
    ).toBe(0);
  });

  test("computeEffectiveCapacity returns 0 when effectiveCapacity is explicitly 0", () => {
    expect(
      computeEffectiveCapacity({
        effectiveCapacity: 0,
        commons: { capacityPerUser: 5 },
        totalUsers: 3,
      }),
    ).toBe(0);
  });

  test("computeEffectiveCapacity returns NaN when capacityPerUser is non-numeric string", () => {
    const result = computeEffectiveCapacity({
      effectiveCapacity: undefined,
      commons: { capacityPerUser: "not-a-number" },
      totalUsers: 3,
    });
    expect(Number.isNaN(Number(result))).toBe(true);
  });

  test("getSortableValue returns null for effectiveCapacity when computed value is NaN", () => {
    const val = getSortableValue(
      {
        effectiveCapacity: undefined,
        commons: { capacityPerUser: "not-a-number" },
        totalUsers: 3,
      },
      "effectiveCapacity",
    );
    expect(val).toBeNull();
  });

  test("createCommonsComparator string-key both-null returns 0 and null-vs-nonnull ordering", () => {
    const comp = createCommonsComparator("commons.name", "asc");
    const a = { commons: { name: null } };
    const b = { commons: { name: null } };
    expect(comp(a, b)).toBe(0);

    const c = { commons: { name: "A" } };
    // In implementation, STRING_DEFAULT_EMPTY_KEYS returns empty string for null,
    // so null -> "" compares before non-empty strings. Expect -1.
    expect(comp(a, c)).toBe(-1);
    expect(comp(c, a)).toBe(1);
  });

  test("computeEffectiveCapacity uses computed value when effectiveCapacity is null", () => {
    // If effectiveCapacity is explicitly null, we should fall back to computed value
    // when capacityPerUser and totalUsers are present.
    expect(
      computeEffectiveCapacity({
        effectiveCapacity: null,
        commons: { capacityPerUser: 3 },
        totalUsers: 4,
      }),
    ).toBe(12);
  });

  test("computeEffectiveCapacity returns null when capacityPerUser missing", () => {
    // If capacityPerUser is omitted/undefined, we must not compute a product.
    expect(
      computeEffectiveCapacity({
        effectiveCapacity: undefined,
        commons: {},
        totalUsers: 5,
      }),
    ).toBeNull();
  });

  test("sorting handles null vs non-null with descending direction", async () => {
    const commons = [
      { commons: { id: 1, name: "NullPrice" }, totalCows: 1 },
      { commons: { id: 2, name: "HasPrice", milkPrice: "50" }, totalCows: 2 },
    ];

    renderCommonsTable({ commons, currentUser: { roles: [] } });

    const toggle = screen.getByTestId("CommonsTable-sort-direction-toggle");
    await userEvent.click(toggle);

    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, "commons.milkPrice");

    const names = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((n) => n.textContent);
    expect(names[0]).toBe("HasPrice");
  });

  test("sorting handles mixed non-string values via toString fallback", async () => {
    const objA = { toString: () => "aaa" };
    const objB = { toString: () => "bbb" };
    const commons = [
      { commons: { id: 101, name: "X", showLeaderboard: objA } },
      { commons: { id: 102, name: "Y", showLeaderboard: objB } },
    ];

    renderCommonsTable({ commons, currentUser: { roles: [] } });

    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, "commons.showLeaderboard");

    expect(screen.getByTestId("CommonsTable-card-0-name")).toHaveTextContent(
      "X",
    );

    const toggle = screen.getByTestId("CommonsTable-sort-direction-toggle");
    await userEvent.click(toggle);

    expect(screen.getByTestId("CommonsTable-card-0-name")).toHaveTextContent(
      "Y",
    );
  });

  test("default id sorting pushes undefined ids to the end in both directions", async () => {
    const commons = [
      { commons: { id: undefined, name: "NoId" }, totalCows: 0 },
      { commons: { id: 2, name: "Two" }, totalCows: 0 },
      { commons: { id: 1, name: "One" }, totalCows: 0 },
    ];

    renderCommonsTable({ commons, currentUser: { roles: [] } });

    const namesAsc = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((node) => node.textContent);
    expect(namesAsc).toEqual(["One", "Two", "NoId"]);

    const toggle = screen.getByTestId("CommonsTable-sort-direction-toggle");
    await userEvent.click(toggle);

    const namesDesc = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((node) => node.textContent);
    expect(namesDesc).toEqual(["Two", "One", "NoId"]);
  });

  test("string comparator handles mixed string and numeric names", async () => {
    const commons = [
      { commons: { id: 1, name: "Alpha" }, totalCows: 0 },
      { commons: { id: 2, name: 123 }, totalCows: 0 },
      { commons: { id: 3, name: "Zulu" }, totalCows: 0 },
    ];

    renderCommonsTable({ commons, currentUser: { roles: [] } });

    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, "commons.name");

    const namesAsc = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((node) => node.textContent);
    expect(namesAsc).toEqual(["123", "Alpha", "Zulu"]);
  });

  test("numeric comparator treats NaN as fallback and keeps NaN entries last", async () => {
    const commons = [
      {
        commons: { id: 1, name: "NaN Entry", cowPrice: Number.NaN },
        totalCows: 0,
      },
      { commons: { id: 2, name: "Five", cowPrice: 5 }, totalCows: 0 },
      { commons: { id: 3, name: "Ten", cowPrice: 10 }, totalCows: 0 },
    ];

    renderCommonsTable({ commons, currentUser: { roles: [] } });

    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, "commons.cowPrice");

    const namesAsc = screen
      .getAllByTestId(/CommonsTable-card-\d+-name/)
      .map((node) => node.textContent);
    expect(namesAsc).toEqual(["Five", "Ten", "NaN Entry"]);
  });

  test("confirm delete calls mutate with expected payload", async () => {
    const commons = [
      {
        commons: { id: 42, name: "ToDelete" },
        totalCows: 0,
      },
    ];

    renderCommonsTable({ commons, currentUser: adminUser });

    await userEvent.click(
      screen.getByTestId("CommonsTable-cell-row-0-col-Delete"),
    );
    await userEvent.click(screen.getByTestId("CommonsTable-Modal-Delete"));

    expect(mockMutate).toHaveBeenCalledWith({
      row: { values: { "commons.id": 42 } },
    });
  });
});
