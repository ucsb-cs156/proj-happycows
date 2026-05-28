import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import CoursesForm from "main/components/Courses/CoursesForm";
import { Navigate } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function CoursesEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: course,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/course?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug
      method: "GET",
      url: `/api/course/${id}`,
    },
  );

  const objectToAxiosPutParams = (course) => ({
    url: `/api/course/${course.id}`,
    method: "PUT",
    data: {
      code: course.code,
      name: course.name,
      term: course.term,
    },
  });

  const onSuccess = (course) => {
    toast(`Course Updated - id: ${course.id} code: ${course.code}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/course?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/admin/listcourses" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Course</h1>
        {course && (
          <CoursesForm
            submitAction={onSubmit}
            buttonLabel={"Update"}
            initialContents={course}
          />
        )}
      </div>
    </BasicLayout>
  );
}
