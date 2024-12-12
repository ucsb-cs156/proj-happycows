import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import StudentsForm from "main/components/Students/StudentsForm";
import { Navigate } from "react-router-dom";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function StudentsCreatePage({ storybook = false }) {
  const objectToAxiosParams = (students) => ({
    url: "/api/Students/post",
    method: "POST",
    params: {
      perm: students.perm,
      lastName: students.lastName,
      firstMiddleName: students.firstMiddleName,
      courseId: students.courseId,
      email: students.email,
    },
  });

  const onSuccess = (students) => {
    toast(
      `New Student Created - id: ${students.id}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/Students/all"],
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
        <h1>Create New Student</h1>

        <StudentsForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
