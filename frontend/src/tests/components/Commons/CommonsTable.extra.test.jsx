import { describe, test, expect } from "vitest";
import {
  formatDate,
  formatBoolean,
  computeEffectiveCapacity,
  getSortableValue,
} from "main/components/Commons/commonsTableUtils";

describe("CommonsTable extra helpers coverage", () => {
  test("formatDate handles empty and ISO-like strings", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("2022-12-12T05:06:07Z")).toBe("2022-12-12");
  });

  test("formatBoolean handles null and booleans", () => {
    expect(formatBoolean(null)).toBe("—");
    expect(formatBoolean(true)).toBe("true");
    expect(formatBoolean(false)).toBe("false");
  });

  test("computeEffectiveCapacity uses effectiveCapacity or falls back", () => {
    const withEff = {
      effectiveCapacity: 42,
      commons: { capacityPerUser: "2" },
      totalUsers: "10",
    };
    expect(computeEffectiveCapacity(withEff)).toBe(42);

    const fallback = {
      effectiveCapacity: undefined,
      commons: { capacityPerUser: "3" },
      totalUsers: "4",
    };
    expect(computeEffectiveCapacity(fallback)).toBe(12);

    const missing = {
      effectiveCapacity: undefined,
      commons: { capacityPerUser: null },
      totalUsers: null,
    };
    expect(computeEffectiveCapacity(missing)).toBeNull();
  });

  test("getSortableValue handles booleans and numeric carry cap", () => {
    const row = {
      commons: {
        showLeaderboard: true,
        showChat: false,
        carryingCapacity: "10",
      },
      totalCows: "7",
    };
    expect(getSortableValue(row, "commons.showLeaderboard")).toBe(true);
    expect(getSortableValue(row, "commons.showChat")).toBe(false);
    expect(getSortableValue(row, "commons.carryingCapacity")).toBe(10);
    expect(getSortableValue(row, "totalCows")).toBe(7);
  });
});
