import { describe, it, expect } from "vitest";
import {
  computeEffectiveCapacity,
  formatPlain,
  formatBoolean,
  getSortableValue,
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

  it("getSortableValue default branch returns null for unknown keys", () => {
    expect(getSortableValue({ commons: {} }, "not.a.real.key")).toBeNull();
  });

  it("numeric getSortableValue returns numbers and respects nullish guards", () => {
    const base = { commons: {}, totalUsers: 0 };
    expect(getSortableValue({ ...base, effectiveCapacity: 5 }, "effectiveCapacity")).toBe(5);
    expect(getSortableValue({ ...base, effectiveCapacity: null }, "effectiveCapacity")).toBeNull();
    expect(getSortableValue({ ...base, effectiveCapacity: undefined }, "effectiveCapacity")).toBeNull();
  });
});
