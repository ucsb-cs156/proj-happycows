import React from "react";
import CourseTable from "main/components/Courses/CourseTable";
import { courseFixtures } from "fixtures/courseFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/Courses/CourseTable",
  component: CourseTable,
};

const Template = (args) => {
  return <CourseTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  courses: [],
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  courses: courseFixtures.threeCourses,
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  courses: courseFixtures.threeCourses,
  currentUser: currentUserFixtures.adminUser,
};

ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/course", () => {
      return HttpResponse.json({ message: "Course deleted" }, { status: 200 });
    }),
  ],
};
