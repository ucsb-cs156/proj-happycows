import React from "react";
import { useParams } from "react-router";
import { Button, Tab, Tabs } from "react-bootstrap";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import StudentsTable from "main/components/Students/StudentsTable";
import StaffTable from "main/components/Staff/StaffTable";
import { useBackend } from "main/utils/useBackend";
import { useCurrentUser } from "main/utils/currentUser";

export default function InstructorAdminShowPage() {
  const { id } = useParams();
  const { data: currentUser } = useCurrentUser();

  // Stryker disable all
  const { data: course } = useBackend(
    [`/api/course/${id}`],
    { method: "GET", url: `/api/course/${id}` },
    null,
  );

  const { data: students } = useBackend(
    [`/api/student/course/${id}`],
    { method: "GET", url: `/api/student/course/${id}` },
    [],
  );

  const { data: staff } = useBackend(
    [`/api/staff/course/${id}`],
    { method: "GET", url: `/api/staff/course/${id}` },
    [],
  );
  // Stryker restore all

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1 data-testid="InstructorAdminShowPage-title">
          {course
            ? `${course.code} - ${course.name} (${course.term})`
            : "Course"}
        </h1>
        <Tabs defaultActiveKey="students" className="mb-3">
          <Tab eventKey="students" title="Students">
            <Button
              variant="primary"
              href={`/admin/createstudents?courseId=${id}`}
              className="mb-3"
              data-testid="InstructorAdminShowPage-addStudent"
            >
              Add Student
            </Button>
            <StudentsTable students={students} currentUser={currentUser} />
          </Tab>
          <Tab eventKey="staff" title="Staff">
            <Button
              variant="primary"
              href={`/admin/createstaff?courseId=${id}`}
              className="mb-3"
              data-testid="InstructorAdminShowPage-addStaff"
            >
              Add Staff
            </Button>
            <StaffTable staff={staff} currentUser={currentUser} />
          </Tab>
        </Tabs>
      </div>
    </BasicLayout>
  );
}
