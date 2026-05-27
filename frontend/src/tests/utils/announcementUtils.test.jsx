import mockConsole from "tests/testutils/mockConsole";
import { vi } from "vitest";
import {
  onDeleteSuccess,
  cellToAxiosParamsDelete,
  toBackendDateTime,
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
  describe("onDeleteSuccess", () => {
    test("It puts the message on console.log and in a toast", () => {
      // arrange
      const restoreConsole = mockConsole();

      // act
      onDeleteSuccess({ id: 17 });

      // assert
      expect(mockToast).toHaveBeenCalledWith("Announcement deleted - id: 17");
      expect(console.log).toHaveBeenCalled();
      const message = console.log.mock.calls[0][0];
      expect(message).toEqual({ id: 17 });

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
  describe("toBackendDateTime", () => {
    test("It returns undefined for blank values", () => {
      expect(toBackendDateTime()).toBeUndefined();
      expect(toBackendDateTime("")).toBeUndefined();
    });

    test("It formats an AM date for the backend", () => {
      expect(toBackendDateTime("2004-12-10T00:12")).toBe(
        "Dec 10, 2004, 12:12:00 AM",
      );
    });

    test("It formats a PM date for the backend", () => {
      expect(toBackendDateTime("2004-12-10T13:45")).toBe(
        "Dec 10, 2004, 1:45:00 PM",
      );
    });
  });
});
