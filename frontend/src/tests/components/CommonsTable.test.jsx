import {
  formatPlain,
  getSortableValue,
} from "main/components/Commons/commonsTableUtils";

describe("CommonsTable sort and formatPlain (utils only)", () => {
  it("formatPlain returns '—' for null/undefined/''", () => {
    expect(formatPlain(null)).toBe("—");
    expect(formatPlain(undefined)).toBe("—");
    expect(formatPlain("")).toBe("—");
    expect(formatPlain(123)).toBe("123");
    expect(formatPlain("abc")).toBe("abc");
  });

  it("getSortableValue only supports id and name", () => {
    expect(getSortableValue({ commons: { id: 1 } }, "commons.id")).toBe(1);
    expect(getSortableValue({ commons: { name: "A" } }, "commons.name")).toBe(
      "A",
    );
    expect(getSortableValue({ commons: {} }, "commons.cowPrice")).toBeNull();
    expect(getSortableValue({ commons: {} }, "notAKey")).toBeNull();
  });
});
