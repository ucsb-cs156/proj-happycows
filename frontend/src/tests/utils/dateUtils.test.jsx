import {
  padWithZero,
  timestampToDate,
  daysSinceTimestamp,
  formatTime,
} from "main/utils/dateUtils";

describe("dateUtils tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2022-06-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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
      expect(daysSinceTimestamp(1653346250816)).toBe(9);
    });

    it("returns 1 day for just under 24 hours", () => {
      expect(
        daysSinceTimestamp(new Date("2022-05-31T12:00:01Z").toISOString()),
      ).toBe(1);
    });

    it("returns 2 days for just over 24 hours", () => {
      expect(
        daysSinceTimestamp(new Date("2022-05-30T11:59:59Z").toISOString()),
      ).toBe(2);
    });
  });

  describe("formatTime tests", () => {
    it("should return empty string for null input", () => {
      expect(formatTime(null)).toEqual("");
    });

    it("should return `Online now` for less than 2 minutes", () => {
      const oneMinuteAgo = new Date("2022-06-01T11:59:00Z").toISOString();
      expect(formatTime(oneMinuteAgo)).toEqual("Online now");
    });

    it("should return `Online now` for 1 second less than 2 minutes", () => {
      const oneSecondUnderTwoMinutesAgo = new Date(
        "2022-06-01T11:58:01Z",
      ).toISOString();
      expect(formatTime(oneSecondUnderTwoMinutesAgo)).toEqual("Online now");
    });

    it("should return 2 minutes ago for exactly 2 minutes", () => {
      const twoMinutesAgo = new Date("2022-06-01T11:58:00Z").toISOString();
      expect(formatTime(twoMinutesAgo)).toEqual("2 minutes ago");
    });

    it("should return minutes ago format", () => {
      const thirtyMinutesAgo = new Date("2022-06-01T11:30:00Z").toISOString();
      expect(formatTime(thirtyMinutesAgo)).toEqual("30 minutes ago");
    });

    it("should return 59 minutes ago just before one hour", () => {
      const fiftyNineMinutes59SecondsAgo = new Date(
        "2022-06-01T11:00:01Z",
      ).toISOString();
      expect(formatTime(fiftyNineMinutes59SecondsAgo)).toEqual(
        "59 minutes ago",
      );
    });

    it("should return hours ago format", () => {
      const threeHoursAgo = new Date("2022-06-01T09:00:00Z").toISOString();
      expect(formatTime(threeHoursAgo)).toEqual("3 hours ago");
    });

    it("should return 1 hour ago for 1 hour", () => {
      const oneHourAgo = new Date("2022-06-01T11:00:00Z").toISOString();
      expect(formatTime(oneHourAgo)).toEqual("1 hour ago");
    });

    it("should return 23 hours ago for 23:59:59", () => {
      const twentyThreeHoursFiftyNineMinutesFiftyNineSecondsAgo = new Date(
        "2022-05-31T12:00:01Z",
      ).toISOString();
      expect(
        formatTime(twentyThreeHoursFiftyNineMinutesFiftyNineSecondsAgo),
      ).toEqual("23 hours ago");
    });

    it("should return days ago format", () => {
      const twoDaysAgo = new Date("2022-05-30T12:00:00Z").toISOString();
      expect(formatTime(twoDaysAgo)).toEqual("2 days ago");
    });

    it("should return 1 day ago for 1 day", () => {
      const oneDayAgo = new Date("2022-05-31T12:00:00Z").toISOString();
      expect(formatTime(oneDayAgo)).toEqual("1 day ago");
    });

    it("should return date string for 7 days", () => {
      const sevenDaysAgo = new Date("2022-05-25T12:00:00Z");
      expect(formatTime(sevenDaysAgo.toISOString())).toEqual(
        sevenDaysAgo.toLocaleDateString(),
      );
    });

    it("should return date string for over a week", () => {
      const twoWeeksAgo = new Date("2022-05-18T12:00:00Z");
      expect(formatTime(twoWeeksAgo.toISOString())).toEqual(
        twoWeeksAgo.toLocaleDateString(),
      );
    });
  });
});
