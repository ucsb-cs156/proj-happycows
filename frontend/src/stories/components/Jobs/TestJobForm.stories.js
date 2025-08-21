import React from "react";

import { action } from "storybook/actions";
import TestJobForm from "main/components/Jobs/TestJobForm";

export default {
  title: "components/Jobs/TestJobForm",
  component: TestJobForm,
};

const Template = (args) => {
  return <TestJobForm {...args} />;
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
  submitAction: action("submit"),
};
