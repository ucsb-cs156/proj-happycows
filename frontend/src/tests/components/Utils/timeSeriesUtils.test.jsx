import {
  expandRangeWhenEqual,
  formatTimestampForTick,
  getGlobalDateRange,
  getGlobalValueRange,
  getSeriesDateRange,
  getSeriesValues,
  isFiniteNumber,
  normalizeSeriesData,
  parseDateToMs,
} from "main/components/Utils/timeSeriesUtils";

describe("timeSeriesUtils", () => {
  test("parseDateToMs returns timestamp for valid date and null for invalid date", () => {
    expect(parseDateToMs("2024-01-01T00:00:00.000Z")).toBe(1704067200000);
    expect(parseDateToMs("not-a-date")).toBeNull();
  });

  test("isFiniteNumber validates numeric values", () => {
    expect(isFiniteNumber(0)).toBe(true);
    expect(isFiniteNumber(3.14)).toBe(true);
    expect(isFiniteNumber(NaN)).toBe(false);
    expect(isFiniteNumber("2")).toBe(false);
  });

  test("getSeriesValues returns values array or empty array", () => {
    expect(getSeriesValues({ values: [{ value: 1 }] })).toEqual([{ value: 1 }]);
    expect(getSeriesValues({ values: null })).toEqual([]);
    expect(getSeriesValues(undefined)).toEqual([]);
  });

  test("getSeriesDateRange returns min and max date for a series", () => {
    const series = {
      values: [
        { date: "2024-01-03T00:00:00.000Z" },
        { date: "2024-01-01T00:00:00.000Z" },
      ],
    };

    expect(getSeriesDateRange(series)).toEqual({
      minDate: 1704067200000,
      maxDate: 1704240000000,
    });
  });

  test("getSeriesDateRange returns nulls when no valid dates", () => {
    expect(getSeriesDateRange({ values: [{ date: "bad-date" }] })).toEqual({
      minDate: null,
      maxDate: null,
    });
  });

  test("getSeriesDateRange ignores null points safely", () => {
    expect(
      getSeriesDateRange({
        values: [null, { date: "2024-01-02T00:00:00.000Z" }],
      }),
    ).toEqual({
      minDate: 1704153600000,
      maxDate: 1704153600000,
    });
  });

  test("getGlobalDateRange uses earliest and latest dates across all series", () => {
    const data = [
      {
        values: [
          { date: "2024-01-03T00:00:00.000Z" },
          { date: "2024-01-05T00:00:00.000Z" },
        ],
      },
      {
        values: [
          { date: "2024-01-01T00:00:00.000Z" },
          { date: "2024-01-04T00:00:00.000Z" },
        ],
      },
    ];

    expect(getGlobalDateRange(data)).toEqual({
      minDate: 1704067200000,
      maxDate: 1704412800000,
    });
  });

  test("getGlobalDateRange returns nulls for non-array data", () => {
    expect(getGlobalDateRange(null)).toEqual({ minDate: null, maxDate: null });
  });

  test("getGlobalDateRange ignores series with no valid date range", () => {
    const data = [
      { values: [{ date: "bad-date" }] },
      { values: [{ date: "2024-01-02T00:00:00.000Z" }] },
    ];

    expect(getGlobalDateRange(data)).toEqual({
      minDate: 1704153600000,
      maxDate: 1704153600000,
    });
  });

  test("getGlobalDateRange keeps pre-epoch max date when other series are invalid", () => {
    const data = [
      { values: [{ date: "bad-date" }] },
      { values: [{ date: "1969-12-31T00:00:00.000Z" }] },
      { values: [{ date: "1969-12-30T00:00:00.000Z" }] },
    ];

    expect(getGlobalDateRange(data)).toEqual({
      minDate: -172800000,
      maxDate: -86400000,
    });
  });

  test("getGlobalValueRange returns min and max values across all series", () => {
    const data = [
      { values: [{ value: 8 }, { value: -2 }] },
      { values: [{ value: 4 }] },
    ];

    expect(getGlobalValueRange(data)).toEqual({ minValue: -2, maxValue: 8 });
  });

  test("getGlobalValueRange ignores invalid values and returns nulls when no numeric values", () => {
    expect(
      getGlobalValueRange([{ values: [{ value: "x" }, { value: NaN }] }]),
    ).toEqual({
      minValue: null,
      maxValue: null,
    });
  });

  test("getGlobalValueRange returns nulls for non-array data", () => {
    expect(getGlobalValueRange(undefined)).toEqual({
      minValue: null,
      maxValue: null,
    });
  });

  test("getGlobalValueRange ignores null points safely", () => {
    expect(
      getGlobalValueRange([
        {
          values: [null, { value: 2 }],
        },
      ]),
    ).toEqual({
      minValue: 2,
      maxValue: 2,
    });
  });

  test("normalizeSeriesData keeps valid points and removes invalid entries", () => {
    const data = [
      {
        name: "A",
        color: "#ff0000",
        values: [
          { date: "2024-01-01T00:00:00.000Z", value: 1 },
          { date: "bad-date", value: 2 },
          { date: "2024-01-03T00:00:00.000Z", value: "x" },
        ],
      },
      {
        name: "B",
        color: "#0000ff",
        values: [{ date: "bad-date", value: 5 }],
      },
    ];

    expect(normalizeSeriesData(data)).toEqual([
      {
        name: "A",
        color: "#ff0000",
        values: [{ dateMs: 1704067200000, value: 1 }],
      },
    ]);
  });

  test("normalizeSeriesData returns empty array for non-array data", () => {
    expect(normalizeSeriesData(undefined)).toEqual([]);
  });

  test("normalizeSeriesData handles null series and null points", () => {
    expect(
      normalizeSeriesData([
        null,
        {
          name: "Safe",
          color: "#111111",
          values: [null, { date: "2024-01-01T00:00:00.000Z", value: 7 }],
        },
      ]),
    ).toEqual([
      {
        name: "Safe",
        color: "#111111",
        values: [{ dateMs: 1704067200000, value: 7 }],
      },
    ]);
  });

  test("expandRangeWhenEqual returns original range when nulls or not equal", () => {
    expect(expandRangeWhenEqual(null, 1)).toEqual([null, 1]);
    expect(expandRangeWhenEqual(1, null)).toEqual([1, null]);
    expect(expandRangeWhenEqual(null, null)).toEqual([null, null]);
    expect(expandRangeWhenEqual(1, 2)).toEqual([1, 2]);
  });

  test("getGlobalValueRange does not touch fallback string values for non-array data", () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      String.prototype,
      "values",
    );

    try {
      Object.defineProperty(String.prototype, "values", {
        configurable: true,
        get() {
          throw new Error("string values accessed");
        },
      });

      expect(() => getGlobalValueRange(undefined)).not.toThrow();
    } finally {
      if (descriptor) {
        Object.defineProperty(String.prototype, "values", descriptor);
      } else {
        delete String.prototype.values;
      }
    }
  });

  test("expandRangeWhenEqual expands equal min and max", () => {
    expect(expandRangeWhenEqual(5, 5)).toEqual([4, 6]);
  });

  test("formatTimestampForTick formats valid timestamp and returns empty string otherwise", () => {
    expect(formatTimestampForTick(1704067200000)).toBe(
      new Date(1704067200000).toLocaleDateString(),
    );
    expect(formatTimestampForTick("x")).toBe("");
  });
});
