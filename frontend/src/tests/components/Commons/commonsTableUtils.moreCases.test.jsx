import { describe, it, expect } from "vitest";
import {
  computeEffectiveCapacity,
  formatPlain,
  formatBoolean,
  formatDate,
  getSortableValue,
  createCommonsComparator,
} from "main/components/Commons/commonsTableUtils";

describe("commonsTableUtils additional edge cases to kill mutants", () => {
  it("computeEffectiveCapacity returns null when capacityPerUser is null/undefined but totalUsers present", () => {
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
        commons: { capacityPerUser: undefined },
        totalUsers: 5,
      }),
    ).toBeNull();
  });

  it("computeEffectiveCapacity returns null when totalUsers is null/undefined but capacityPerUser present", () => {
    expect(
      computeEffectiveCapacity({
        effectiveCapacity: null,
        commons: { capacityPerUser: 3 },
        totalUsers: null,
      }),
    ).toBeNull();

    expect(
      computeEffectiveCapacity({
        effectiveCapacity: null,
        commons: { capacityPerUser: 3 },
        totalUsers: undefined,
      }),
    ).toBeNull();
  });

  it("getSortableValue for effectiveCapacity normalizes invalid to null (empty string)", () => {
    expect(
      getSortableValue({ effectiveCapacity: "" }, "effectiveCapacity"),
    ).toBeNull();
  });

  it("getSortableValue for effectiveCapacity normalizes invalid to null (non-numeric)", () => {
    expect(
      getSortableValue({ effectiveCapacity: "abc" }, "effectiveCapacity"),
    ).toBeNull();
  });

  it("formatPlain returns em dash for nullish and empty values but preserves real strings", () => {
    expect(formatPlain(null)).toBe("—");
    expect(formatPlain(undefined)).toBe("—");
    expect(formatPlain("")).toBe("—");
    expect(formatPlain("Stryker was here!")).toBe("Stryker was here!");
  });

  it("formatBoolean mirrors formatPlain semantics for nullish inputs and truthy booleans", () => {
    expect(formatBoolean(null)).toBe("—");
    expect(formatBoolean(undefined)).toBe("—");
    expect(formatBoolean("")).toBe("—");
    expect(formatBoolean(true)).toBe("true");
    expect(formatBoolean(false)).toBe("false");
  });

  it("formatDate returns em dash for falsy and slices ISO strings", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("")).toBe("—");
    expect(formatDate("2024-07-09T12:34:56.000Z")).toBe("2024-07-09");
  });

  it("getSortableValue handles showChat and capacityPerUser cases", () => {
    const commonsPlus = {
      commons: {
        showChat: true,
        capacityPerUser: "7",
      },
    };

    expect(getSortableValue(commonsPlus, "commons.showChat")).toBe(true);
    expect(getSortableValue(commonsPlus, "commons.capacityPerUser")).toBe(7);
  });

  it("getSortableValue does not throw when commons object is missing", () => {
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
    ];
    const keysExpectEmptyString = [
      "commons.name",
      "commons.startingDate",
      "commons.lastDate",
    ];
    const commonsPlus = {};
    keysExpectNull.forEach((key) => {
      expect(() => getSortableValue(commonsPlus, key)).not.toThrow();
      expect(getSortableValue(commonsPlus, key)).toBeNull();
    });
    keysExpectEmptyString.forEach((key) => {
      expect(() => getSortableValue(commonsPlus, key)).not.toThrow();
      expect(getSortableValue(commonsPlus, key)).toBe("");
    });
  });

  it("getSortableValue default branch returns null for unknown keys", () => {
    expect(getSortableValue({ commons: {} }, "not.a.real.key")).toBeNull();
  });

  it("getSortableValue returns empty string fallback for missing names and date fields", () => {
    expect(getSortableValue({ commons: {} }, "commons.name")).toBe("");
    expect(getSortableValue({ commons: {} }, "commons.startingDate")).toBe("");
    expect(getSortableValue({ commons: {} }, "commons.lastDate")).toBe("");
  });

  it("numeric getSortableValue returns numbers and respects nullish guards", () => {
    const base = { commons: {}, totalUsers: 0 };
    expect(
      getSortableValue({ ...base, effectiveCapacity: 5 }, "effectiveCapacity"),
    ).toBe(5);
    expect(
      getSortableValue(
        { ...base, effectiveCapacity: null },
        "effectiveCapacity",
      ),
    ).toBeNull();
    expect(
      getSortableValue(
        { ...base, effectiveCapacity: undefined },
        "effectiveCapacity",
      ),
    ).toBeNull();
  });

  it("createCommonsComparator pushes missing values to the end regardless of direction", () => {
    const missing = { commons: { id: 1 }, totalCows: null };
    const present = { commons: { id: 2 }, totalCows: 5 };

    const asc = createCommonsComparator("totalCows", "asc");
    expect(asc(missing, present)).toBe(1);
    expect(asc(present, missing)).toBe(-1);
    expect(asc(missing, missing)).toBe(0);

    const desc = createCommonsComparator("totalCows", "desc");
    expect(desc(missing, present)).toBe(1);
    expect(desc(present, missing)).toBe(-1);
  });

  it("createCommonsComparator compares numeric values respecting direction", () => {
    const commonsA = { commons: { cowPrice: 5 } };
    const commonsB = { commons: { cowPrice: 10 } };

    const asc = createCommonsComparator("commons.cowPrice", "asc");
    expect(asc(commonsA, commonsB)).toBeLessThan(0);

    const desc = createCommonsComparator("commons.cowPrice", "desc");
    expect(desc(commonsA, commonsB)).toBeGreaterThan(0);
  });

  it("createCommonsComparator compares string values lexicographically", () => {
    const commonsA = { commons: { name: "Alpha" } };
    const commonsB = { commons: { name: "Zulu" } };

    const asc = createCommonsComparator("commons.name", "asc");
    expect(asc(commonsA, commonsB)).toBeLessThan(0);

    const desc = createCommonsComparator("commons.name", "desc");
    expect(desc(commonsA, commonsB)).toBeGreaterThan(0);
  });

  it("createCommonsComparator defaults to ascending when direction omitted", () => {
    const a = { commons: { id: 1 } };
    const b = { commons: { id: 2 } };
    const comparator = createCommonsComparator("commons.id");
    expect(comparator(a, b)).toBeLessThan(0);
    expect(comparator(b, a)).toBeGreaterThan(0);
  });

  it("createCommonsComparator returns 0 when numeric values are equal", () => {
    const a = { commons: { cowPrice: 7 } };
    const b = { commons: { cowPrice: 7 } };
    const comparator = createCommonsComparator("commons.cowPrice", "asc");
    expect(comparator(a, b)).toBe(0);
    expect(comparator(b, a)).toBe(0);
  });

  it("createCommonsComparator throws on invalid sortDirection", () => {
    expect(() => createCommonsComparator("commons.name", "zzz")).toThrow(
      /Invalid sort direction/,
    );
  });
});
