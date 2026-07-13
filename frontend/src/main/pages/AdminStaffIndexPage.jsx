import React from "react";
import { useBackend } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import StaffTable from "main/components/Staff/StaffTable";
import { useCurrentUser } from "main/utils/currentUser";
import { Button } from "react-bootstrap";

export default function AdminStaffIndexPage() {
  const { data: currentUser } = useCurrentUser();

  // Stryker disable  all
  const {
    data: staff,
    error: _error,
    status: _status,
  } = useBackend(
    ["/api/staff/all"],
    { method: "GET", url: "/api/staff/all" },
    [],
  );
  // Stryker restore  all

  const createButton = () => {
    return (
      <Button
        variant="primary"
        href="/admin/createstaff"
        style={{ float: "right" }}
      >
        Create New Staff
      </Button>
    );
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>Staff</h1>
        <StaffTable staff={staff} currentUser={currentUser} />
      </div>
    </BasicLayout>
  );
}
