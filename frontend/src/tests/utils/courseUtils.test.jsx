import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/courseUtils";
import { vi } from "vitest";

const mockToast = vi.fn();

vi.mock("react-toastify", async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...original,
    toast: (message) => mockToast(message),
  };
});

describe("courseUtils tests", () => {
  describe("onDeleteSuccess", () => {
    test("logs message and shows toast", () => {
      onDeleteSuccess({
        message: "Course deleted!",
      });

      expect(mockToast).toHaveBeenCalledWith("Course deleted!");
    });
  });

  describe("cellToAxiosParamsDelete", () => {
    test("returns correct axios params", () => {
      const cell = { row: { values: { id: 42 } } };

      const result = cellToAxiosParamsDelete(cell);

      expect(result).toEqual({
        url: "/api/course/42",
        method: "DELETE",
      });
    });
  });
});
