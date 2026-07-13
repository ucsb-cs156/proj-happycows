import { toast } from "react-toastify";

export function onDeleteSuccess(message) {
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsDelete(cell) {
  return {
    url: "/api/commons",
    method: "DELETE",
    params: {
      id: cell.row.values["commons.id"],
    },
  };
}

// A commons with no course is visible to everyone. A course-linked commons
// is only visible to users enrolled in that course (as a student or staff
// member), or to admins. See issue #251.
export function isEligibleForCourseLinkedCommons(
  commons,
  myCourseIds,
  isAdmin,
) {
  if (commons.courseId == null) {
    return true;
  }
  if (isAdmin) {
    return true;
  }
  return myCourseIds.includes(commons.courseId);
}

export function filterCommonsNotJoinedAndNotHidden(
  commons,
  commonsJoined,
  myCourseIds = [],
  isAdmin = false,
) {
  const joinedIdList = commonsJoined.map((c) => c.id);
  return commons.filter(
    (f) =>
      !f.hidden &&
      !joinedIdList.includes(f.id) &&
      isEligibleForCourseLinkedCommons(f, myCourseIds, isAdmin),
  );
}

export function filterCommonsJoinedAndNotHidden(
  commons,
  commonsJoined,
  myCourseIds = [],
  isAdmin = false,
) {
  const joinedIdList = commonsJoined.map((c) => c.id);
  return commons.filter(
    (f) =>
      !f.hidden &&
      joinedIdList.includes(f.id) &&
      isEligibleForCourseLinkedCommons(f, myCourseIds, isAdmin),
  );
}
