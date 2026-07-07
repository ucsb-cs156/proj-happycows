import {
  getHashTargetId,
  HASH_SCROLL_INTO_VIEW_OPTIONS,
  shouldScrollToHash,
} from "main/utils/hashScrollUtils";

describe("hashScrollUtils tests", () => {
  test("shouldScrollToHash is false when hash is empty", () => {
    expect(
      shouldScrollToHash({
        hash: "",
        commonsLength: 3,
        lastScrolledHash: null,
      }),
    ).toBe(false);
  });

  test("shouldScrollToHash is false when commons are not loaded", () => {
    expect(
      shouldScrollToHash({
        hash: "#2",
        commonsLength: 0,
        lastScrolledHash: null,
      }),
    ).toBe(false);
  });

  test("shouldScrollToHash is false when hash was already scrolled", () => {
    expect(
      shouldScrollToHash({
        hash: "#2",
        commonsLength: 3,
        lastScrolledHash: "#2",
      }),
    ).toBe(false);
  });

  test("shouldScrollToHash is true when hash exists and is new", () => {
    expect(
      shouldScrollToHash({
        hash: "#2",
        commonsLength: 3,
        lastScrolledHash: "#1",
      }),
    ).toBe(true);
  });

  test("getHashTargetId strips the leading hash", () => {
    expect(getHashTargetId("#2")).toBe("2");
  });

  test("HASH_SCROLL_INTO_VIEW_OPTIONS uses smooth start scrolling", () => {
    expect(HASH_SCROLL_INTO_VIEW_OPTIONS).toEqual({
      behavior: "smooth",
      block: "start",
    });
  });
});
