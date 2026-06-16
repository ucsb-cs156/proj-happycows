import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import CoursesForm from "main/components/Courses/CoursesForm";
import { Navigate } from "react-router";
import { toast } from "react-toastify";

import { useBackendMutation } from "main/utils/useBackend";

const AdminCoursesCreatePage = () => {
  const objectToAxiosParams = (newCourse) => ({
    url: `/api/course`,
    method: "POST",
    data: newCourse,
  });

  const onSuccess = (course) => {
    toast(
      <div>
        Course successfully created!
        <br />
        {`id: ${course.id}`}
        <br />
        {`code: ${course.code}`}
        <br />
        {`name: ${course.name}`}
        <br />
        {`term: ${course.term}`}
      </div>,
    );
  };

  // Stryker disable all
  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/course/all"],
  );
  // Stryker restore all

  const submitAction = async (data) => {
    mutation.mutate(data);
  };

  if (mutation.isSuccess) {
    return <Navigate to="/admin/listcourses" />;
  }

  return (
    <BasicLayout>
      <h2>Create Course</h2>
      <CoursesForm submitAction={submitAction} />
    </BasicLayout>
  );
};

export default AdminCoursesCreatePage;
