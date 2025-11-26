import React from "react";
import { action } from "storybook/actions";
import CommonsFeaturesForm from "main/components/Commons/CommonsFeaturesForm";
import commonsFeaturesFixtures from "fixtures/commonsFeaturesFixtures";

export default {
  title: "components/Commons/CommonsFeaturesForm",
  component: CommonsFeaturesForm,
};

const Template = (args) => {
  return <CommonsFeaturesForm {...args} />;
};

export const SingleFeature = Template.bind({});
SingleFeature.args = {
  features: commonsFeaturesFixtures.singleFeature,
  onSubmit: action("onSubmit"),
};

export const ThreeFeatures = Template.bind({});
ThreeFeatures.args = {
  features: commonsFeaturesFixtures.threeFeatures,
  onSubmit: action("onSubmit"),
};
