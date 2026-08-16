import { act, renderHook } from "@testing-library/react";
import usePageSize from "main/utils/usePageSize";

describe("usePageSize tests", () => {
  const STORAGE_KEY = "test-page-size";

  beforeEach(() => {
    localStorage.clear();
  });

  test("defaults to defaultPageSize when nothing is stored in localStorage", () => {
    const { result } = renderHook(() =>
      usePageSize({ storageKey: STORAGE_KEY }),
    );

    const [pageSize] = result.current;
    expect(pageSize).toBe(20);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("20");
  });

  test("uses a custom defaultPageSize and options", () => {
    const { result } = renderHook(() =>
      usePageSize({
        storageKey: STORAGE_KEY,
        options: [10, 25, 50],
        defaultPageSize: 25,
      }),
    );

    const [pageSize] = result.current;
    expect(pageSize).toBe(25);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("25");
  });

  test("uses the value stored in localStorage when it is a valid option", () => {
    localStorage.setItem(STORAGE_KEY, "100");

    const { result } = renderHook(() =>
      usePageSize({ storageKey: STORAGE_KEY }),
    );

    const [pageSize] = result.current;
    expect(pageSize).toBe(100);
  });

  test("falls back to defaultPageSize and updates localStorage when the stored value is not a valid option", () => {
    localStorage.setItem(STORAGE_KEY, "37");

    const { result } = renderHook(() =>
      usePageSize({ storageKey: STORAGE_KEY }),
    );

    const [pageSize] = result.current;
    expect(pageSize).toBe(20);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("20");
  });

  test("updates the page size and localStorage when the setter is called", () => {
    const { result } = renderHook(() =>
      usePageSize({ storageKey: STORAGE_KEY }),
    );

    act(() => {
      const [, setPageSize] = result.current;
      setPageSize(50);
    });

    const [pageSize] = result.current;
    expect(pageSize).toBe(50);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("50");
  });
});
