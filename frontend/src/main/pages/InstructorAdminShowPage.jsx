import React from "react";
import { useParams } from "react-router";
import { Tab, Tabs } from "react-bootstrap";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import StudentsTabComponent from "main/components/Students/StudentsTabComponent";
import StaffTabComponent from "main/components/Staff/StaffTabComponent";
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
            <StudentsTabComponent courseId={id} currentUser={currentUser} />
          </Tab>
          <Tab eventKey="staff" title="Staff">
            <StaffTabComponent courseId={id} currentUser={currentUser} />
          </Tab>
        </Tabs>
      </div>
    </BasicLayout>
  );
}
