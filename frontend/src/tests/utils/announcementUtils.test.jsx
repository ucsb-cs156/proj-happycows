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

    test("returns non-datetime-local values unchanged", () => {
      expect(datetimeLocalToIsoDateTime("")).toBe("");
      expect(datetimeLocalToIsoDateTime(null)).toBe(null);
      expect(datetimeLocalToIsoDateTime(undefined)).toBe(undefined);
      expect(datetimeLocalToIsoDateTime(0)).toBe(0);

      const nonStringWithIsoShape = {
        toString: () => "2024-12-12T00:00",
      };
      expect(datetimeLocalToIsoDateTime(nonStringWithIsoShape)).toBe(
        nonStringWithIsoShape,
      );
    });

    test("does not modify values that do not match datetime-local format", () => {
      expect(datetimeLocalToIsoDateTime("2024-12-12T00:00:00.000Z")).toBe(
        "2024-12-12T00:00:00.000Z",
      );
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
        url: "/api/announcements/delete",
        method: "DELETE",
        params: { id: 1 },
      });
    });
  });
});
