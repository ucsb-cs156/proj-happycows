import mockConsole from "tests/testutils/mockConsole";
import commonsFixtures from "fixtures/commonsFixtures";
import { vi } from "vitest";
import {
  cellToAxiosParamsDelete,
  filterCommonsJoinedAndNotHidden,
  filterCommonsNotJoinedAndNotHidden,
  isEligibleForCourseLinkedCommons,
  onDeleteSuccess,
} from "main/utils/commonsUtils";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("CommonsUtils", () => {
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
      const cell = { row: { values: { "commons.id": 17 } } };

      // act
      const result = cellToAxiosParamsDelete(cell);

      // assert
      expect(result).toEqual({
        url: "/api/commons",
        method: "DELETE",
        params: { id: 17 },
      });
    });
  });

  describe("filterCommonsNotJoinedAndNotHidden", () => {
    test("it computes the correct result", () => {
      // arrange
      const allCommons = commonsFixtures.sevenCommons;
      const commonsJoined = [allCommons[0], allCommons[2], allCommons[4]];
      const expectedCommonsNotJoined = [
        allCommons[1],
        allCommons[3],
        allCommons[5],
        allCommons[6],
      ];

      // act
      const result = filterCommonsNotJoinedAndNotHidden(
        allCommons,
        commonsJoined,
      );

      // assert
      expect(result).toEqual(expectedCommonsNotJoined);
    });

    test("excludes a course-linked commons when the user is not eligible for the course", () => {
      const noCourse = { id: 1, hidden: false, courseId: null };
      const myCourse = { id: 2, hidden: false, courseId: 5 };
      const otherCourse = { id: 3, hidden: false, courseId: 99 };
      const allCommons = [noCourse, myCourse, otherCourse];

      const result = filterCommonsNotJoinedAndNotHidden(
        allCommons,
        [],
        [5],
        false,
      );

      expect(result).toEqual([noCourse, myCourse]);
    });

    test("includes all course-linked commons when the user is an admin", () => {
      const noCourse = { id: 1, hidden: false, courseId: null };
      const otherCourse = { id: 3, hidden: false, courseId: 99 };
      const allCommons = [noCourse, otherCourse];

      const result = filterCommonsNotJoinedAndNotHidden(
        allCommons,
        [],
        [],
        true,
      );

      expect(result).toEqual(allCommons);
    });

    test("defaults to excluding course-linked commons when myCourseIds/isAdmin are omitted", () => {
      const noCourse = { id: 1, hidden: false, courseId: null };
      const otherCourse = { id: 3, hidden: false, courseId: 99 };
      const allCommons = [noCourse, otherCourse];

      const result = filterCommonsNotJoinedAndNotHidden(allCommons, []);

      expect(result).toEqual([noCourse]);
    });
  });

  describe("filterCommonsJoinedAndNotHidden", () => {
    test("it computes the correct result", () => {
      const allCommons = commonsFixtures.sevenCommons;
      const commonsJoined = [allCommons[0], allCommons[2], allCommons[4]];

      const result = filterCommonsJoinedAndNotHidden(allCommons, commonsJoined);

      expect(result).toEqual(commonsJoined);
    });

    test("excludes a joined course-linked commons when the user is not eligible for the course", () => {
      const myCourse = { id: 2, hidden: false, courseId: 5 };
      const otherCourse = { id: 3, hidden: false, courseId: 99 };
      const allCommons = [myCourse, otherCourse];
      const commonsJoined = [myCourse, otherCourse];

      const result = filterCommonsJoinedAndNotHidden(
        allCommons,
        commonsJoined,
        [5],
        false,
      );

      expect(result).toEqual([myCourse]);
    });

    test("defaults to excluding a joined course-linked commons when myCourseIds/isAdmin are omitted", () => {
      const noCourse = { id: 1, hidden: false, courseId: null };
      const otherCourse = { id: 3, hidden: false, courseId: 99 };
      const allCommons = [noCourse, otherCourse];
      const commonsJoined = [noCourse, otherCourse];

      const result = filterCommonsJoinedAndNotHidden(allCommons, commonsJoined);

      expect(result).toEqual([noCourse]);
    });
  });

  describe("isEligibleForCourseLinkedCommons", () => {
    test("returns true when the commons has no course", () => {
      const commons = { id: 1, courseId: null };
      expect(isEligibleForCourseLinkedCommons(commons, [], false)).toBe(true);
    });

    test("returns true for an admin regardless of course", () => {
      const commons = { id: 1, courseId: 5 };
      expect(isEligibleForCourseLinkedCommons(commons, [], true)).toBe(true);
    });

    test("returns true when the user's course ids include the commons' course", () => {
      const commons = { id: 1, courseId: 5 };
      expect(isEligibleForCourseLinkedCommons(commons, [5], false)).toBe(true);
    });

    test("returns false when the user's course ids do not include the commons' course", () => {
      const commons = { id: 1, courseId: 5 };
      expect(isEligibleForCourseLinkedCommons(commons, [6], false)).toBe(false);
    });
  });
});
