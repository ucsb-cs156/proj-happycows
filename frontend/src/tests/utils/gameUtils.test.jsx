import mockConsole from "tests/testutils/mockConsole";
import gameFixtures from "fixtures/gameFixtures";
import { vi } from "vitest";
import {
  cellToAxiosParamsDelete,
  filterGameJoinedAndNotHidden,
  filterGameNotJoinedAndNotHidden,
  isEligibleForCourseLinkedGame,
  onDeleteSuccess,
} from "main/utils/gameUtils";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("GameUtils", () => {
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
      const cell = { row: { values: { "game.id": 17 } } };

      // act
      const result = cellToAxiosParamsDelete(cell);

      // assert
      expect(result).toEqual({
        url: "/api/game",
        method: "DELETE",
        params: { id: 17 },
      });
    });
  });

  describe("filterGameNotJoinedAndNotHidden", () => {
    test("it computes the correct result", () => {
      // arrange
      const allGame = gameFixtures.sevenGame;
      const gameJoined = [allGame[0], allGame[2], allGame[4]];
      const expectedGameNotJoined = [
        allGame[1],
        allGame[3],
        allGame[5],
        allGame[6],
      ];

      // act
      const result = filterGameNotJoinedAndNotHidden(allGame, gameJoined);

      // assert
      expect(result).toEqual(expectedGameNotJoined);
    });

    test("excludes a course-linked game when the user is not eligible for the course", () => {
      const noCourse = { id: 1, hidden: false, courseId: null };
      const myCourse = { id: 2, hidden: false, courseId: 5 };
      const otherCourse = { id: 3, hidden: false, courseId: 99 };
      const allGame = [noCourse, myCourse, otherCourse];

      const result = filterGameNotJoinedAndNotHidden(allGame, [], [5], false);

      expect(result).toEqual([noCourse, myCourse]);
    });

    test("includes all course-linked game when the user is an admin", () => {
      const noCourse = { id: 1, hidden: false, courseId: null };
      const otherCourse = { id: 3, hidden: false, courseId: 99 };
      const allGame = [noCourse, otherCourse];

      const result = filterGameNotJoinedAndNotHidden(allGame, [], [], true);

      expect(result).toEqual(allGame);
    });

    test("defaults to excluding course-linked game when myCourseIds/isAdmin are omitted", () => {
      const noCourse = { id: 1, hidden: false, courseId: null };
      const otherCourse = { id: 3, hidden: false, courseId: 99 };
      const allGame = [noCourse, otherCourse];

      const result = filterGameNotJoinedAndNotHidden(allGame, []);

      expect(result).toEqual([noCourse]);
    });
  });

  describe("filterGameJoinedAndNotHidden", () => {
    test("it computes the correct result", () => {
      const allGame = gameFixtures.sevenGame;
      const gameJoined = [allGame[0], allGame[2], allGame[4]];

      const result = filterGameJoinedAndNotHidden(allGame, gameJoined);

      expect(result).toEqual(gameJoined);
    });

    test("excludes a joined course-linked game when the user is not eligible for the course", () => {
      const myCourse = { id: 2, hidden: false, courseId: 5 };
      const otherCourse = { id: 3, hidden: false, courseId: 99 };
      const allGame = [myCourse, otherCourse];
      const gameJoined = [myCourse, otherCourse];

      const result = filterGameJoinedAndNotHidden(
        allGame,
        gameJoined,
        [5],
        false,
      );

      expect(result).toEqual([myCourse]);
    });

    test("defaults to excluding a joined course-linked game when myCourseIds/isAdmin are omitted", () => {
      const noCourse = { id: 1, hidden: false, courseId: null };
      const otherCourse = { id: 3, hidden: false, courseId: 99 };
      const allGame = [noCourse, otherCourse];
      const gameJoined = [noCourse, otherCourse];

      const result = filterGameJoinedAndNotHidden(allGame, gameJoined);

      expect(result).toEqual([noCourse]);
    });
  });

  describe("isEligibleForCourseLinkedGame", () => {
    test("returns true when the game has no course", () => {
      const game = { id: 1, courseId: null };
      expect(isEligibleForCourseLinkedGame(game, [], false)).toBe(true);
    });

    test("returns true for an admin regardless of course", () => {
      const game = { id: 1, courseId: 5 };
      expect(isEligibleForCourseLinkedGame(game, [], true)).toBe(true);
    });

    test("returns true when the user's course ids include the game' course", () => {
      const game = { id: 1, courseId: 5 };
      expect(isEligibleForCourseLinkedGame(game, [5], false)).toBe(true);
    });

    test("returns false when the user's course ids do not include the game' course", () => {
      const game = { id: 1, courseId: 5 };
      expect(isEligibleForCourseLinkedGame(game, [6], false)).toBe(false);
    });
  });
});
