import { describe, it, expect } from "vitest";
import {
  getSortableValue,
  computeEffectiveCapacity,
} from "../../../../src/main/components/Commons/commonsTableUtils";

describe("CommonsTable getSortableValue exhaustive tests", () => {
  it("returns null when commonsPlus is falsy", () => {
    expect(getSortableValue(null, "commons.id")).toBeNull();
    expect(getSortableValue(undefined, "commons.name")).toBeNull();
  });

  it("handles numeric keys: numbers, numeric-strings, non-numeric, empty, null", () => {
    const cp = { commons: { milkPrice: 12 }, totalCows: 5 };
    expect(getSortableValue(cp, "commons.milkPrice")).toBe(12);

    const cp2 = { commons: { milkPrice: "34" } };
    expect(getSortableValue(cp2, "commons.milkPrice")).toBe(34);

    const cp3 = { commons: { milkPrice: "abc" } };
    expect(getSortableValue(cp3, "commons.milkPrice")).toBeNull();

    const cp4 = { commons: { milkPrice: "" } };
    expect(getSortableValue(cp4, "commons.milkPrice")).toBeNull();

    const cp5 = { totalCows: "7" };
    expect(getSortableValue(cp5, "totalCows")).toBe(7);

    const cp6 = { totalCows: null };
    expect(getSortableValue(cp6, "totalCows")).toBeNull();
  });

  it("handles string/date keys and returns defaults for missing", () => {
    const cp = {
      commons: {
        name: "Farm A",
        startingDate: "2020-01-02T00:00:00Z",
        lastDate: null,
      },
    };
    expect(getSortableValue(cp, "commons.name")).toBe("Farm A");
    // startingDate is returned as-is (string)
    expect(getSortableValue(cp, "commons.startingDate")).toBe(
      "2020-01-02T00:00:00Z",
    );
    // lastDate null -> returns null (since key handled as startingDate/lastDate later returns val ?? '')
    expect(getSortableValue(cp, "commons.lastDate")).toBe("");
  });

  it("handles boolean-like fields", () => {
    const cp = { commons: { showLeaderboard: true, showChat: false } };
    expect(getSortableValue(cp, "commons.showLeaderboard")).toBe(true);
    expect(getSortableValue(cp, "commons.showChat")).toBe(false);
    const cp2 = { commons: {} };
    expect(getSortableValue(cp2, "commons.showLeaderboard")).toBeNull();
  });

  it("covers additional numeric switch cases and missing commons behavior", () => {
    const cpCow = { commons: { cowPrice: "15" } };
    expect(getSortableValue(cpCow, "commons.cowPrice")).toBe(15);

    const cpCowBad = { commons: { cowPrice: "nope" } };
    expect(getSortableValue(cpCowBad, "commons.cowPrice")).toBeNull();

    const cpDeg = { commons: { degradationRate: "0.5" } };
    expect(getSortableValue(cpDeg, "commons.degradationRate")).toBeCloseTo(0.5);

    const cpCarry = { commons: { carryingCapacity: "100" } };
    expect(getSortableValue(cpCarry, "commons.carryingCapacity")).toBe(100);

    const cpMissingCommons = { totalCows: 1 };
    // when commons is missing, name/startingDate/lastDate should return safe defaults
    expect(getSortableValue(cpMissingCommons, "commons.name")).toBe("");
    expect(getSortableValue(cpMissingCommons, "commons.startingDate")).toBe("");
    expect(getSortableValue(cpMissingCommons, "commons.lastDate")).toBe("");
  });

  it("computes effectiveCapacity correctly in all branches", () => {
    const withExplicit = {
      effectiveCapacity: 123,
      commons: { capacityPerUser: 2 },
      totalUsers: 10,
    };
    expect(computeEffectiveCapacity(withExplicit)).toBe(123);

    const computed = {
      effectiveCapacity: null,
      commons: { capacityPerUser: 3 },
      totalUsers: 4,
    };
    expect(computeEffectiveCapacity(computed)).toBe(12);

    const unknown = {
      effectiveCapacity: null,
      commons: { capacityPerUser: null },
      totalUsers: null,
    };
    expect(computeEffectiveCapacity(unknown)).toBeNull();
  });
});
