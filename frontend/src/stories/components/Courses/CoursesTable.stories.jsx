import React from "react";

import CoursesTable from "main/components/Courses/CoursesTable";
import { coursesFixtures } from "fixtures/coursesFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

export default {
  title: "components/courses/CoursesTable",
  component: CoursesTable,
};

const Template = (args) => <CoursesTable {...args} />;

export const Empty = Template.bind({});
Empty.args = {
  courses: [],
};

export const ThreeCourses = Template.bind({});
ThreeCourses.args = {
  courses: coursesFixtures.threeCourses,
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeCoursesAdmin = Template.bind({});
ThreeCoursesAdmin.args = {
  courses: coursesFixtures.threeCourses,
  currentUser: currentUserFixtures.adminUser,
};

export const OneCourseAdmin = Template.bind({});
OneCourseAdmin.args = {
  courses: coursesFixtures.oneCourse,
  currentUser: currentUserFixtures.adminUser,
};
