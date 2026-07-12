import { vi } from "vitest";
import {
  FOCUS_SCROLL_MARGIN,
  computeScrollTop,
  getFocusTargetId,
  scrollToFocusTarget,
} from "main/utils/focusScrollUtils";

describe("focusScrollUtils tests", () => {
  describe("getFocusTargetId", () => {
    test("returns the focus query parameter value", () => {
      expect(getFocusTargetId("?focus=7")).toBe("7");
    });

    test("returns the focus value when other parameters are present", () => {
      expect(getFocusTargetId("?other=1&focus=42")).toBe("42");
    });

    test("returns null when there is no focus parameter", () => {
      expect(getFocusTargetId("")).toBe(null);
      expect(getFocusTargetId("?other=1")).toBe(null);
    });
  });

  describe("computeScrollTop", () => {
    test("FOCUS_SCROLL_MARGIN is 16", () => {
      expect(FOCUS_SCROLL_MARGIN).toBe(16);
    });

    test("adds scrollY and subtracts navbar height and margin", () => {
      expect(
        computeScrollTop({ elementTop: 300, scrollY: 150, navbarHeight: 52 }),
      ).toBe(300 + 150 - 52 - FOCUS_SCROLL_MARGIN);
    });
  });

  describe("scrollToFocusTarget", () => {
    afterEach(() => {
      document.body.innerHTML = "";
    });

    const makeWin = ({ scrollY }) => ({
      document,
      scrollY,
      scrollTo: vi.fn(),
    });

    test("scrolls so the target sits below the navbar and returns true", () => {
      document.body.innerHTML = `<nav class="navbar"></nav><div id="7"></div>`;
      document.querySelector(".navbar").getBoundingClientRect = () => ({
        height: 52,
      });
      document.getElementById("7").getBoundingClientRect = () => ({
        top: 300,
      });
      const win = makeWin({ scrollY: 150 });

      expect(scrollToFocusTarget({ targetId: "7", win })).toBe(true);

      expect(win.scrollTo).toHaveBeenCalledTimes(1);
      expect(win.scrollTo).toHaveBeenCalledWith({
        top: 300 + 150 - 52 - FOCUS_SCROLL_MARGIN,
        behavior: "smooth",
      });
    });

    test("treats a missing navbar as zero height", () => {
      document.body.innerHTML = `<div id="7"></div>`;
      document.getElementById("7").getBoundingClientRect = () => ({
        top: 300,
      });
      const win = makeWin({ scrollY: 150 });

      expect(scrollToFocusTarget({ targetId: "7", win })).toBe(true);

      expect(win.scrollTo).toHaveBeenCalledWith({
        top: 300 + 150 - FOCUS_SCROLL_MARGIN,
        behavior: "smooth",
      });
    });

    test("does not scroll and returns false when the target is missing", () => {
      document.body.innerHTML = `<nav class="navbar"></nav>`;
      const win = makeWin({ scrollY: 150 });

      expect(scrollToFocusTarget({ targetId: "7", win })).toBe(false);

      expect(win.scrollTo).not.toHaveBeenCalled();
    });
  });
});
