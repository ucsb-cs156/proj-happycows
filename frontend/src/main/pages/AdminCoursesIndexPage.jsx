import React from "react";
import { useBackend } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import CoursesTable from "main/components/Courses/CoursesTable";
import { useCurrentUser } from "main/utils/currentUser";
import { Button } from "react-bootstrap";

export default function AdminCoursesIndexPage() {
  const { data: currentUser } = useCurrentUser();

  // Stryker disable  all
  const {
    data: courses,
    error: _error,
    status: _status,
  } = useBackend(
    ["/api/course/all"],
    { method: "GET", url: "/api/course/all" },
    [],
  );
  // Stryker restore  all

  const createButton = () => {
    return (
      <Button
        variant="primary"
        href="/admin/createcourses"
        style={{ float: "right" }}
      >
        Create New Course
      </Button>
    );
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
