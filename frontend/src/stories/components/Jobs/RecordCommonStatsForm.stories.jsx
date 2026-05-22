import React from "react";

import { action } from "storybook/actions";
import RecordCommonStatsForm from "main/components/Jobs/RecordCommonStatsForm";

export default {
  title: "components/Jobs/RecordCommonStatsForm",
  component: RecordCommonStatsForm,
};

const Template = (args) => {
  return <RecordCommonStatsForm {...args} />;
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
  submitAction: action("submit"),
};
