import {
  fieldOrBlank,
  getCommonsId,
  getCommonsName,
  getIsHidden,
  getStartingDate,
  getDaysActive,
  formatOneDecimal,
  numericFieldOrBlank,
} from "main/utils/dashboardUtils";

describe("dashboardUtils tests", () => {
  describe("fieldOrBlank tests", () => {
    it("returns field value when present", () => {
      const commonsPlus = {
        totalUsers: 5,
      };
      expect(fieldOrBlank(commonsPlus, "totalUsers")).toBe(5);
    });

    it("returns `--` when field is missing", () => {
      const commonsPlus = {};
      expect(fieldOrBlank(commonsPlus, "totalUsers")).toBe("--");
    });

    it("returns `--` when field is null", () => {
      const commonsPlus = {
        totalUsers: null,
      };
      expect(fieldOrBlank(commonsPlus, "totalUsers")).toBe("--");
    });
  });

  describe("getCommonsId tests", () => {
    it("returns commons id when present", () => {
      const commonsPlus = {
        commons: {
          id: 17,
        },
      };
      expect(getCommonsId(commonsPlus, 0)).toBe(17);
    });

    it("returns id param when commons id is missing", () => {
      const commonsPlus = {
        commons: {},
      };
      expect(getCommonsId(commonsPlus, 18)).toBe(18);
    });

    it("returns id param when commons is null", () => {
      const commonsPlus = {
        commons: null,
      };
      expect(getCommonsId(commonsPlus, 19)).toBe(19);
    });

    it("returns `--` when both commons id and id param are missing", () => {
      expect(getCommonsId(null, null)).toBe("--");
    });
  });

  describe("getCommonsName tests", () => {
    it("returns commons name when present", () => {
      const commonsPlus = {
        commons: {
          name: "Happy Cows",
        },
      };
      expect(getCommonsName(commonsPlus)).toBe("Happy Cows");
    });

    it("returns `--` when commons name is missing", () => {
      const commonsPlus = {
        commons: {},
      };
      expect(getCommonsName(commonsPlus)).toBe("--");
    });

    it("returns `--` when commons is null", () => {
      const commonsPlus = {
        commons: null,
      };
      expect(getCommonsName(commonsPlus)).toBe("--");
    });

    it("returns `--` when commonsPlus is null", () => {
      expect(getCommonsName(null)).toBe("--");
    });
  });

  describe("getIsHidden tests", () => {
    it("returns true when commons is hidden", () => {
      const commonsPlus = {
        commons: {
          hidden: true,
        },
      };
      expect(getIsHidden(commonsPlus)).toBe(true);
    });

    it("returns false when commons is not hidden", () => {
      const commonsPlus = {
        commons: {
          hidden: false,
        },
      };
      expect(getIsHidden(commonsPlus)).toBe(false);
    });

    it("returns false when hidden field is missing", () => {
      const commonsPlus = {
        commons: {},
      };
      expect(getIsHidden(commonsPlus)).toBe(false);
    });

    it("returns false when commons is null", () => {
      const commonsPlus = {
        commons: null,
      };
      expect(getIsHidden(commonsPlus)).toBe(false);
    });

    it("returns false when commonsPlus is null", () => {
      expect(getIsHidden(null)).toBe(false);
    });
  });

  describe("getStartingDate tests", () => {
    it("returns starting date when present", () => {
      const commonsPlus = {
        commons: {
          startingDate: "2024-06-01T00:00:00",
        },
      };
      expect(getStartingDate(commonsPlus)).toBe("2024-06-01");
    });

    it("returns `--` when starting date is missing", () => {
      const commonsPlus = {
        commons: {},
      };
      expect(getStartingDate(commonsPlus)).toBe("--");
    });

    it("returns `--` when commons is null", () => {
      const commonsPlus = {
        commons: null,
      };
      expect(getStartingDate(commonsPlus)).toBe("--");
    });
  });

  describe("getDaysActive tests", () => {
    it("returns days active when starting date is present", () => {
      const commonsPlus = {
        commons: {
          startingDate: "2024-06-01T00:00:00",
        },
      };
      vi.useFakeTimers().setSystemTime(new Date("2024-06-10"));
      expect(getDaysActive(commonsPlus)).toBe(9);
    });

    it("returns `--` when starting date is missing", () => {
      const commonsPlus = {
        commons: {},
      };
      expect(getDaysActive(commonsPlus)).toBe("--");
    });

    it("returns `--` when commons is null", () => {
      const commonsPlus = {
        commons: null,
      };
      expect(getDaysActive(commonsPlus)).toBe("--");
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
      const commonsPlus = {
        averageCowsPerFarmer: 3.14159,
      };
      expect(numericFieldOrBlank(commonsPlus, "averageCowsPerFarmer")).toBe(
        "3.1",
      );
    });

    it("returns `--` when field is missing", () => {
      const commonsPlus = {};
      expect(numericFieldOrBlank(commonsPlus, "averageCowsPerFarmer")).toBe(
        "--",
      );
    });

    it("returns `--` when field is null", () => {
      const commonsPlus = {
        averageCowsPerFarmer: null,
      };
      expect(numericFieldOrBlank(commonsPlus, "averageCowsPerFarmer")).toBe(
        "--",
      );
    });

    it("returns `--` when field is non-numeric", () => {
      const commonsPlus = {
        averageCowsPerFarmer: "not-a-number",
      };
      expect(numericFieldOrBlank(commonsPlus, "averageCowsPerFarmer")).toBe(
        "--",
      );
    });
  });
});
