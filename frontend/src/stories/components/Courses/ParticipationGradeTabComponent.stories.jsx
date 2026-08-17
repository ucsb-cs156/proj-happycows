import React from "react";

import ParticipationGradeTabComponent from "main/components/Courses/ParticipationGradeTabComponent";

export default {
  title: "components/Courses/ParticipationGradeTabComponent",
  component: ParticipationGradeTabComponent,
};

const Template = (args) => <ParticipationGradeTabComponent {...args} />;

export const Default = Template.bind({});
Default.args = {
  courseId: 1,
};
