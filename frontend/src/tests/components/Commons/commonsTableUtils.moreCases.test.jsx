import { describe, it, expect } from "vitest";
import {
  computeEffectiveCapacity,
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
});
