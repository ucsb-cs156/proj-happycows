import {
  fieldOrBlank,
  getGameId,
  getGameName,
  getIsHidden,
  getStartingDate,
  getDaysActive,
  formatOneDecimal,
  numericFieldOrBlank,
  getPercentageOfCarryingCapacity,
} from "main/utils/dashboardUtils";

describe("dashboardUtils tests", () => {
  describe("fieldOrBlank tests", () => {
    it("returns field value when present", () => {
      const gamePlus = {
        totalUsers: 5,
      };
      expect(fieldOrBlank(gamePlus, "totalUsers")).toBe(5);
    });

    it("returns `--` when field is missing", () => {
      const gamePlus = {};
      expect(fieldOrBlank(gamePlus, "totalUsers")).toBe("--");
    });

    it("returns `--` when field is null", () => {
      const gamePlus = {
        totalUsers: null,
      };
      expect(fieldOrBlank(gamePlus, "totalUsers")).toBe("--");
    });
  });

  describe("getGameId tests", () => {
    it("returns game id when present", () => {
      const gamePlus = {
        game: {
          id: 17,
        },
      };
      expect(getGameId(gamePlus, 0)).toBe(17);
    });

    it("returns id param when game id is missing", () => {
      const gamePlus = {
        game: {},
      };
      expect(getGameId(gamePlus, 18)).toBe(18);
    });

    it("returns id param when game is null", () => {
      const gamePlus = {
        game: null,
      };
      expect(getGameId(gamePlus, 19)).toBe(19);
    });

    it("returns `--` when both game id and id param are missing", () => {
      expect(getGameId(null, null)).toBe("--");
    });
  });

  describe("getGameName tests", () => {
    it("returns game name when present", () => {
      const gamePlus = {
        game: {
          name: "Happy Cows",
        },
      };
      expect(getGameName(gamePlus)).toBe("Happy Cows");
    });

    it("returns `--` when game name is missing", () => {
      const gamePlus = {
        game: {},
      };
      expect(getGameName(gamePlus)).toBe("--");
    });

    it("returns `--` when game is null", () => {
      const gamePlus = {
        game: null,
      };
      expect(getGameName(gamePlus)).toBe("--");
    });

    it("returns `--` when gamePlus is null", () => {
      expect(getGameName(null)).toBe("--");
    });
  });

  describe("getIsHidden tests", () => {
    it("returns true when game is hidden", () => {
      const gamePlus = {
        game: {
          hidden: true,
        },
      };
      expect(getIsHidden(gamePlus)).toBe(true);
    });

    it("returns false when game is not hidden", () => {
      const gamePlus = {
        game: {
          hidden: false,
        },
      };
      expect(getIsHidden(gamePlus)).toBe(false);
    });

    it("returns false when hidden field is missing", () => {
      const gamePlus = {
        game: {},
      };
      expect(getIsHidden(gamePlus)).toBe(false);
    });

    it("returns false when game is null", () => {
      const gamePlus = {
        game: null,
      };
      expect(getIsHidden(gamePlus)).toBe(false);
    });

    it("returns false when gamePlus is null", () => {
      expect(getIsHidden(null)).toBe(false);
    });
  });

  describe("getStartingDate tests", () => {
    it("returns starting date when present", () => {
      const gamePlus = {
        game: {
          startingDate: "2024-06-01T00:00:00",
        },
      };
      expect(getStartingDate(gamePlus)).toBe("2024-06-01");
    });

    it("returns `--` when starting date is missing", () => {
      const gamePlus = {
        game: {},
      };
      expect(getStartingDate(gamePlus)).toBe("--");
    });

    it("returns `--` when game is null", () => {
      const gamePlus = {
        game: null,
      };
      expect(getStartingDate(gamePlus)).toBe("--");
    });
  });

  describe("getDaysActive tests", () => {
    it("returns days active when starting date is present", () => {
      const gamePlus = {
        game: {
          startingDate: "2024-06-01T00:00:00",
        },
      };
      vi.useFakeTimers().setSystemTime(new Date("2024-06-10"));
      expect(getDaysActive(gamePlus)).toBe(9);
    });

    it("returns `--` when starting date is missing", () => {
      const gamePlus = {
        game: {},
      };
      expect(getDaysActive(gamePlus)).toBe("--");
    });

    it("returns `--` when game is null", () => {
      const gamePlus = {
        game: null,
      };
      expect(getDaysActive(gamePlus)).toBe("--");
    });
  });

  describe("formatOneDecimal tests", () => {
    it("formats number to one decimal place", () => {
      expect(formatOneDecimal(3.14159)).toBe("3.1");
    });

    it("returns `--` for null", () => {
      expect(formatOneDecimal(null)).toBe("--");
    });

    it("returns `--` for undefined", () => {
      expect(formatOneDecimal(undefined)).toBe("--");
    });

    it("returns `--` for non-numeric values", () => {
      expect(formatOneDecimal("not-a-number")).toBe("--");
    });

    it("returns `--` for NaN", () => {
      expect(formatOneDecimal(NaN)).toBe("--");
    });

    it("returns the number with one decimal place for valid numeric input", () => {
      expect(formatOneDecimal(5)).toBe("5.0");
      expect(formatOneDecimal(2.718)).toBe("2.7");
    });

    it("returns `--` for values that are undefined", () => {
      expect(formatOneDecimal(undefined)).toBe("--");
    });
  });

  describe("numericFieldOrBlank tests", () => {
    it("returns formatted number when field is present and numeric", () => {
      const gamePlus = {
        averageCowsPerFarmer: 3.14159,
      };
      expect(numericFieldOrBlank(gamePlus, "averageCowsPerFarmer")).toBe("3.1");
    });

    it("returns `--` when field is missing", () => {
      const gamePlus = {};
      expect(numericFieldOrBlank(gamePlus, "averageCowsPerFarmer")).toBe("--");
    });

    it("returns `--` when field is null", () => {
      const gamePlus = {
        averageCowsPerFarmer: null,
      };
      expect(numericFieldOrBlank(gamePlus, "averageCowsPerFarmer")).toBe("--");
    });

    it("returns `--` when field is non-numeric", () => {
      const gamePlus = {
        averageCowsPerFarmer: "not-a-number",
      };
      expect(numericFieldOrBlank(gamePlus, "averageCowsPerFarmer")).toBe("--");
    });
  });

  describe("getPercentageOfCarryingCapacity tests", () => {
    it("returns the percentage formatted with two decimal places", () => {
      expect(getPercentageOfCarryingCapacity(11, 20)).toBe("55.00%");
    });

    it("returns `--` when effective capacity is zero", () => {
      expect(getPercentageOfCarryingCapacity(11, 0)).toBe("--");
    });

    it("returns `--` when total cows is non-numeric", () => {
      expect(getPercentageOfCarryingCapacity("not-a-number", 20)).toBe("--");
    });

    it("returns `--` when effective capacity is non-numeric", () => {
      expect(getPercentageOfCarryingCapacity(11, "not-a-number")).toBe("--");
    });

    it("returns `--` when either value is missing", () => {
      expect(getPercentageOfCarryingCapacity(undefined, undefined)).toBe("--");
    });
  });
});
