import React from "react";
import { useBackend } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import CoursesTable from "main/components/Courses/CoursesTable";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import { Button } from "react-bootstrap";

export default function CoursesIndexPage() {
  const { data: currentUser } = useCurrentUser();
  const {
    data: courses,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/course/all"],
    { url: "/api/course/all" },
    // Stryker disable next-line all : don't test default value of empty list
    [],
  );

  const createButton = () => {
    if (hasRole(currentUser, "ROLE_ADMIN")) {
      return (
        <Button
          variant="primary"
          href="/admin/createcourses"
          style={{ float: "right" }}
        >
          Create Course
        </Button>
      );
    }
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>Courses</h1>
        <CoursesTable courses={courses} currentUser={currentUser} />
      </div>
    </BasicLayout>
  );
}
