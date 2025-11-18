import { describe, test, expect } from "vitest";
import {
  formatPlain,
  getSortableValue,
} from "main/components/Commons/commonsTableUtils";

describe("CommonsTable helpers unit tests", () => {
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

  test("getSortableValue returns commons.id and name", () => {
    const row = { commons: { id: 7, name: "Seven" } };
    expect(getSortableValue(row, "commons.id")).toBe(7);
    expect(getSortableValue(row, "commons.name")).toBe("Seven");
  });

  test("getSortableValue parses numeric fields and returns null for invalid", () => {
    const row = {
      commons: { cowPrice: "5.5", capacityPerUser: "notanumber" },
      totalCows: "3",
    };
    expect(getSortableValue(row, "commons.cowPrice")).toBe(5.5);
    expect(getSortableValue(row, "commons.capacityPerUser")).toBeNull();
    expect(getSortableValue(row, "totalCows")).toBe(3);
  });

  test("getSortableValue handles date and boolean fields", () => {
    const row = {
      commons: {
        startingDate: "2022-12-12",
        showLeaderboard: true,
        showChat: false,
      },
    };
    expect(getSortableValue(row, "commons.startingDate")).toBe("2022-12-12");
    expect(getSortableValue(row, "commons.showLeaderboard")).toBe(true);
    expect(getSortableValue(row, "commons.showChat")).toBe(false);
  });

  test("getSortableValue effectiveCapacity uses row.effectiveCapacity when finite", () => {
    const row = {
      effectiveCapacity: 42,
      commons: { capacityPerUser: "2" },
      totalUsers: "10",
    };
    expect(getSortableValue(row, "effectiveCapacity")).toBe(42);
  });

  test("getSortableValue effectiveCapacity falls back to capacityPerUser * totalUsers", () => {
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
});
