import mockConsole from "tests/testutils/mockConsole";
import { vi } from "vitest";
import {
  onDeleteSuccess,
  cellToAxiosParamsDeleteReport,
  cellToAxiosParamsPurgeReports,
} from "main/utils/reportUtils";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("reportUtils", () => {
  describe("onDeleteSuccess", () => {
    test("It puts the message on console.log and in a toast", () => {
      // arrange
      const restoreConsole = mockConsole();

      // act
      onDeleteSuccess("abc");

      // assert
      expect(mockToast).toHaveBeenCalledWith("abc");
      expect(console.log).toHaveBeenCalled();
      const message = console.log.mock.calls[0][0];
      expect(message).toMatch("abc");

      restoreConsole();
    });
  });

  describe("cellToAxiosParamsDeleteReport", () => {
    test("It returns the correct params", () => {
      // arrange
      const cell = { row: { values: { id: 17 } } };

      // act
      const result = cellToAxiosParamsDeleteReport(cell);

      // assert
      expect(result).toEqual({
        url: "/api/reports",
        method: "DELETE",
        params: { reportId: 17 },
      });
    });
  });

  describe("cellToAxiosParamsPurgeReports", () => {
    test("It returns the correct params", () => {
      // arrange
      const cell = { row: { values: { id: 17 } } };

      // act
      const result = cellToAxiosParamsPurgeReports(cell);

      // assert
      expect(result).toEqual({
        url: "/api/reports/purge",
        method: "DELETE",
        params: { reportId: 17 },
      });
    });
  });
});
