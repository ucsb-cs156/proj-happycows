import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import StaffForm from "main/components/Staff/StaffForm";
import { Navigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";

import { useBackendMutation } from "main/utils/useBackend";

const AdminStaffCreatePage = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");

  const objectToAxiosParams = (newStaff) => ({
    url: `/api/staff`,
    method: "POST",
    data: newStaff,
  });

  const onSuccess = (staff) => {
    toast(
      <div>
        Staff member successfully created!
        <br />
        {`id: ${staff.id}`}
        <br />
        {`lastName: ${staff.lastName}`}
        <br />
        {`email: ${staff.email}`}
      </div>,
    );
  };

  // Stryker disable all
  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/staff/all"],
  );
  // Stryker restore all

  const submitAction = async (data) => {
    mutation.mutate(data);
  };

  if (mutation.isSuccess) {
    return <Navigate to="/admin/liststaff" />;
  }

  return (
    <BasicLayout>
      <h2>Create Staff</h2>
      <StaffForm
        submitAction={submitAction}
        initialContents={courseId ? { courseId: Number(courseId) } : null}
      />
    </BasicLayout>
  );
};

export default AdminStaffCreatePage;
