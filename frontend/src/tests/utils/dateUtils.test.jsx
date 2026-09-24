import {
  padWithZero,
  timestampToDate,
  daysSinceTimestamp,
  formatTime,
  formatDateTime,
  formatPacificTimestamp,
  formatPacificDate,
} from "main/utils/dateUtils";

describe("dateUtils tests", () => {
  describe("padWithZero tests", () => {
    test("pads when less than 10", () => {
      expect(padWithZero(0)).toBe("00");
      expect(padWithZero(1)).toBe("01");
      expect(padWithZero(9)).toBe("09");
    });

    test("does not pad with 10 or greater", () => {
      expect(padWithZero(10)).toBe(10);
      expect(padWithZero(11)).toBe(11);
    });
  });

  describe("timestampToDate tests", () => {
    it("converts properly", () => {
      expect(timestampToDate(1653346250816)).toBe("2022-05-23");
    });
  });

  describe("daysSinceTimestamp tests", () => {
    it("calculates days properly", () => {
      vi.useFakeTimers().setSystemTime(new Date("2022-06-01"));
      expect(daysSinceTimestamp(1653346250816)).toBe(9);
    });
  });

  describe("formatDateTime tests", () => {
    it("should return empty string for null or empty input", () => {
      expect(formatDateTime(null)).toEqual("");
      expect(formatDateTime("")).toEqual("");
    });

    it("should return empty string for invalid date", () => {
      expect(formatDateTime("not-a-date")).toEqual("");
    });

    it("formats ISO date-time without seconds or timezone", () => {
      expect(formatDateTime("2024-12-12T00:00:00")).toMatch(
        /12\/12\/2024, 12:00 AM/,
      );
    });
  });

  describe("formatPacificTimestamp tests", () => {
    // These strings are naive Pacific LocalDateTimes with no timezone
    // offset (see FarmerActivityService/MilkTheCowsJob, issues #291/#318) -
    // formatPacificTimestamp must read their digits directly rather than
    // via `new Date(...)`, which would reinterpret them using the test
    // runner's own local timezone instead of Pacific.
    it("formats a morning (AM) timestamp", () => {
      expect(formatPacificTimestamp("2024-01-15T10:20:00")).toBe(
        "01/15/2024, 10:20 AM",
      );
    });

    it("formats an afternoon (PM) timestamp", () => {
      expect(formatPacificTimestamp("2024-01-15T14:05:00")).toBe(
        "01/15/2024, 2:05 PM",
      );
    });

    it("formats midnight as 12:00 AM", () => {
      expect(formatPacificTimestamp("2024-01-15T00:00:00")).toBe(
        "01/15/2024, 12:00 AM",
      );
    });

    it("formats noon as 12:00 PM", () => {
      expect(formatPacificTimestamp("2024-01-15T12:00:00")).toBe(
        "01/15/2024, 12:00 PM",
      );
    });

    it("returns an empty string for a null value", () => {
      expect(formatPacificTimestamp(null)).toBe("");
    });

    it("returns an empty string for a value that doesn't match the expected format", () => {
      expect(formatPacificTimestamp("not-a-date")).toBe("");
    });
  });

  describe("formatPacificDate tests", () => {
    it("extracts the date portion from a naive Pacific timestamp", () => {
      expect(formatPacificDate("2024-01-15T23:45:00")).toBe("2024-01-15");
    });

    it("returns an empty string for a null value", () => {
      expect(formatPacificDate(null)).toBe("");
    });

    it("returns an empty string for a value that doesn't match the expected format", () => {
      expect(formatPacificDate("not-a-date")).toBe("");
    });
  });

  describe("formatTime tests", () => {
    it("should return empty string for null input", () => {
      expect(formatTime(null)).toEqual("");
    });

    it("should return `Online now` for less than 2 minutes", () => {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
      expect(formatTime(oneMinuteAgo)).toEqual("Online now");
    });

    it("should return minutes ago format", () => {
      const thirtyMinutesAgo = new Date(
        Date.now() - 2 * 60 * 1000,
      ).toISOString();
      expect(formatTime(thirtyMinutesAgo)).toEqual("2 minutes ago");
    });

    it("should return hours ago format", () => {
      const threeHoursAgo = new Date(
        Date.now() - 3 * 60 * 60 * 1000,
      ).toISOString();
      expect(formatTime(threeHoursAgo)).toEqual("3 hours ago");
    });

    it("should return 1 hour ago for 1 hour", () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      expect(formatTime(oneHourAgo)).toEqual("1 hour ago");
    });

    it("should return days ago format", () => {
      const twoDaysAgo = new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(formatTime(twoDaysAgo)).toEqual("2 days ago");
    });

    it("should return 1 day ago for 1 day", () => {
      const oneDayAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(formatTime(oneDayAgo)).toEqual("1 day ago");
    });

    it("should return date string for over a week", () => {
      const twoWeeksAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      expect(formatTime(twoWeeksAgo.toISOString())).toEqual(
        twoWeeksAgo.toLocaleDateString(),
      );
    });
  });
});
