import { toast } from "react-toastify";

export function onDeleteSuccess(message) {
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsDelete(cell) {
  return {
    url: "/api/game",
    method: "DELETE",
    params: {
      id: cell.row.values["game.id"],
    },
  };
}

// A game with no course is visible to everyone. A course-linked game
// is only visible to users enrolled in that course (as a student or staff
// member), or to admins. See issue #251.
export function isEligibleForCourseLinkedGame(game, myCourseIds, isAdmin) {
  if (game.courseId == null) {
    return true;
  }
  if (isAdmin) {
    return true;
  }
  return myCourseIds.includes(game.courseId);
}

export function filterGameNotJoinedAndNotHidden(
  game,
  gameJoined,
  // Stryker disable next-line ArrayDeclaration : any placeholder array is
  // behaviorally equivalent to [] here, since .includes() on a real numeric
  // courseId will never match Stryker's string placeholder either way.
  myCourseIds = [],
  isAdmin = false,
) {
  const joinedIdList = gameJoined.map((c) => c.id);
  return game.filter(
    (f) =>
      !f.hidden &&
      !joinedIdList.includes(f.id) &&
      isEligibleForCourseLinkedGame(f, myCourseIds, isAdmin),
  );
}

export function filterGameJoinedAndNotHidden(
  game,
  gameJoined,
  // Stryker disable next-line ArrayDeclaration : any placeholder array is
  // behaviorally equivalent to [] here, since .includes() on a real numeric
  // courseId will never match Stryker's string placeholder either way.
  myCourseIds = [],
  isAdmin = false,
) {
  const joinedIdList = gameJoined.map((c) => c.id);
  return game.filter(
    (f) =>
      !f.hidden &&
      joinedIdList.includes(f.id) &&
      isEligibleForCourseLinkedGame(f, myCourseIds, isAdmin),
  );
}
