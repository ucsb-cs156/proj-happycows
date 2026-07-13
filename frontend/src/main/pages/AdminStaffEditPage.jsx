import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import StaffForm from "main/components/Staff/StaffForm";
import { Navigate } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function AdminStaffEditPage() {
  let { id } = useParams();

  const {
    data: staff,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/staff/${id}`],
    {
      // Stryker disable next-line all : GET is the default, so changing this to "" doesn't introduce a bug
      method: "GET",
      url: `/api/staff/${id}`,
    },
  );

  const objectToAxiosPutParams = (staff) => ({
    url: `/api/staff/${id}`,
    method: "PUT",
    data: {
      lastName: staff.lastName,
      firstMiddleName: staff.firstMiddleName,
      email: staff.email,
      courseId: staff.courseId,
    },
  });

  const onSuccess = (staff) => {
    toast(
      `Staff Updated - id: ${staff.id} lastName: ${staff.lastName} email: ${staff.email}`,
    );
  };

  // Stryker disable all
  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/staff/${id}`],
  );
  // Stryker restore all

  const { isSuccess } = mutation;

  const submitAction = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess) {
    return <Navigate to="/admin/liststaff" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Staff</h1>
        {staff && (
          <StaffForm
            initialContents={staff}
            submitAction={submitAction}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
