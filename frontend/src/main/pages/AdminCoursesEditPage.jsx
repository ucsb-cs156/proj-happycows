import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import CourseForm from "main/components/Courses/CourseForm";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { Navigate, useParams } from "react-router";
import { toast } from "react-toastify";

export default function AdminCoursesEditPage() {
  const { id } = useParams();

  const { data: course } = useBackend([`/api/course/${id}`], {
    method: "GET",
    url: `/api/course/${id}`,
  });

  const objectToAxiosParams = (updatedCourse) => ({
    url: `/api/course/${updatedCourse.id}`,
    method: "PUT",
    data: {
      code: updatedCourse.code,
      name: updatedCourse.name,
      term: updatedCourse.term,
    },
  });

  const onSuccess = (_, updatedCourse) => {
    toast(
      `Course updated - id: ${updatedCourse.id} code: ${updatedCourse.code}`,
    );
  };

  const mutation = useBackendMutation(objectToAxiosParams, { onSuccess }, [
    `/api/course/${id}`,
  ]);

  const submitAction = async (data) => {
    mutation.mutate(data);
  };

  if (mutation.isSuccess) {
    return <Navigate to="/admin/listcourses" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Course</h1>
        {course && (
          <CourseForm
            initialCourse={course}
            submitAction={submitAction}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
