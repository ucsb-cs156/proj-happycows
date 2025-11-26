import React from "react";
import CourseForm from "main/components/Courses/CourseForm";
import { courseFixtures } from "fixtures/courseFixtures";

export default {
  title: "components/Courses/CourseForm",
  component: CourseForm,
};

const Template = (args) => {
  return <CourseForm {...args} />;
};

export const Create = Template.bind({});

Create.args = {
  buttonLabel: "Create",
  submitAction: (data) => {
    console.log("Submit was clicked with data: ", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data));
  },
};

export const Update = Template.bind({});

Update.args = {
  initialContents: courseFixtures.oneCourse,
  buttonLabel: "Update",
  submitAction: (data) => {
    console.log("Submit was clicked with data: ", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data));
  },
};
