import mockConsole from "tests/testutils/mockConsole";
import { vi } from "vitest";
import {
  onDeleteSuccess,
  cellToAxiosParamsDelete,
  datetimeLocalToIsoDateTime,
} from "main/utils/announcementUtils";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("AnnouncementUtils", () => {
  describe("datetimeLocalToIsoDateTime", () => {
    test("appends seconds when datetime-local omits them", () => {
      expect(datetimeLocalToIsoDateTime("2024-12-12T00:00")).toBe(
        "2024-12-12T00:00:00",
      );
    });

    test("leaves values with seconds unchanged", () => {
      expect(datetimeLocalToIsoDateTime("2024-12-12T00:00:00")).toBe(
        "2024-12-12T00:00:00",
      );
    });

    test("returns empty values unchanged", () => {
      expect(datetimeLocalToIsoDateTime("")).toBe("");
      expect(datetimeLocalToIsoDateTime(null)).toBe(null);
    });
  });

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
  describe("cellToAxiosParamsDelete", () => {
    test("It returns the correct params", () => {
      // arrange
      const cell = { row: { values: { id: 1 } } };

      // act
      const result = cellToAxiosParamsDelete(cell);

      // assert
      expect(result).toEqual({
        url: "/api/announcements",
        method: "DELETE",
        params: { id: 1 },
      });
    });
  });
});
