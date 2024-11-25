import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";
import StudentsForm from "main/components/Students/StudentsForm";
import { Navigate } from "react-router-dom";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function StudentsEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: students,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/StudentsEdits?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so changing this to "" doesn't introduce a bug
      method: "GET",
      url: `/api/Students`,
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (students) => ({
    url: "/api/Students",
    method: "PUT",
    params: {
      id: students.id,
    },
    data: {
      perm: students.perm,
      lastName: students.lastName,
      firstMiddleName: students.firstMiddleName,
      courseId: students.courseId,
      email: students.email,
    },
  });

  const onSuccess = (students) => {
    toast(
      `Student Updated - id: ${students.id} Team ID: ${students.teamId}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/Students?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/admin/Students" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Student</h1>
        {students && (
          <StudentsForm
            initialContents={students}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
