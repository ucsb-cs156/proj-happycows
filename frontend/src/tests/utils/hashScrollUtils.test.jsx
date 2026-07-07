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
        locationKey: "a",
        lastScrolledHash: null,
        lastScrolledLocationKey: null,
      }),
    ).toBe(false);
  });

  test("shouldScrollToHash is false when commons are not loaded", () => {
    expect(
      shouldScrollToHash({
        hash: "#2",
        commonsLength: 0,
        locationKey: "a",
        lastScrolledHash: null,
        lastScrolledLocationKey: null,
      }),
    ).toBe(false);
  });

  test("shouldScrollToHash is false when hash was already scrolled", () => {
    expect(
      shouldScrollToHash({
        hash: "#2",
        commonsLength: 3,
        locationKey: "a",
        lastScrolledHash: "#2",
        lastScrolledLocationKey: "a",
      }),
    ).toBe(false);
  });

  test("shouldScrollToHash is true when hash exists and hash is new", () => {
    expect(
      shouldScrollToHash({
        hash: "#2",
        commonsLength: 3,
        locationKey: "a",
        lastScrolledHash: "#1",
        lastScrolledLocationKey: "a",
      }),
    ).toBe(true);
  });

  test("shouldScrollToHash is true when same hash arrives on a new navigation key", () => {
    expect(
      shouldScrollToHash({
        hash: "#2",
        commonsLength: 3,
        locationKey: "b",
        lastScrolledHash: "#2",
        lastScrolledLocationKey: "a",
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
