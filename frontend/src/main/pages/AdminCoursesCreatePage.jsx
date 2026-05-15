import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import CourseForm from "main/components/Courses/CourseForm";
import { useBackendMutation } from "main/utils/useBackend";
import { Navigate } from "react-router";
import { toast } from "react-toastify";

export default function AdminCoursesCreatePage() {
  const objectToAxiosParams = (newCourse) => ({
    url: "/api/course",
    method: "POST",
    data: newCourse,
  });

  const onSuccess = (course) => {
    toast(`Course created - id: ${course.id} code: ${course.code}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    ["/api/course/all"],
  );

  const submitAction = async (data) => {
    mutation.mutate(data);
  };

  if (mutation.isSuccess) {
    return <Navigate to="/admin/listcourses" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create Course</h1>
        <CourseForm submitAction={submitAction} />
      </div>
    </BasicLayout>
  );
}
