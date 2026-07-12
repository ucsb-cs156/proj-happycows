import React from "react";
import { Card, Form } from "react-bootstrap";

// A single unified UX pattern for wrapping a section of the Dashboard.
// Admins (not currently viewing "as a student") always see every section,
// along with a switch that lets them show/hide the section for students.
// Students (and admins previewing the "View as Student" mode) only ever
// see sections that have been marked visible.
export default function DashboardSectionCard({
  title,
  visible,
  isAdminView,
  onToggleVisible,
  testid,
  children,
}) {
  if (!isAdminView && !visible) {
    return null;
  }

  return (
    <Card className="mb-4 w-100" data-testid={testid}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>{title}</span>
        {isAdminView && (
          <Form.Check
            type="switch"
            id={`${testid}-visible-switch`}
            data-testid={`${testid}-visible-switch`}
            label={visible ? "Shown to Students" : "Hidden from Students"}
            checked={!!visible}
            onChange={(e) => onToggleVisible(e.target.checked)}
          />
        )}
      </Card.Header>
      <Card.Body>{children}</Card.Body>
    </Card>
  );
}
