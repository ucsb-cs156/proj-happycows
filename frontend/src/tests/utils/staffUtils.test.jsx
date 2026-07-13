import mockConsole from "tests/testutils/mockConsole";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/staffUtils";
import { vi } from "vitest";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    toast: (message) => mockToast(message),
  };
});

describe("staffUtils tests", () => {
  describe("onDeleteSuccess", () => {
    test("logs message and shows toast", () => {
      const restoreConsole = mockConsole();

      onDeleteSuccess("Staff deleted!");

      expect(mockToast).toHaveBeenCalledWith("Staff deleted!");
      expect(console.log).toHaveBeenCalled();
      expect(console.log.mock.calls[0][0]).toMatch("Staff deleted!");

      restoreConsole();
    });
  });

  describe("cellToAxiosParamsDelete", () => {
    test("returns correct axios params", () => {
      const cell = { row: { values: { id: 42 } } };

      const result = cellToAxiosParamsDelete(cell);

      expect(result).toEqual({
        url: `/api/staff/${cell.row.values.id}`,
        method: "DELETE",
      });
    });
  });
});
