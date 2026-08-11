import React from "react";
import { action } from "storybook/actions";
import GameFeaturesForm from "main/components/Game/GameFeaturesForm";
import gameFeaturesFixtures from "fixtures/gameFeaturesFixtures";

export default {
  title: "components/Game/GameFeaturesForm",
  component: GameFeaturesForm,
};

const Template = (args) => {
  return <GameFeaturesForm {...args} />;
};

export const SingleFeature = Template.bind({});
SingleFeature.args = {
  features: gameFeaturesFixtures.singleFeature,
  onSubmit: action("onSubmit"),
};

export const ThreeFeatures = Template.bind({});
ThreeFeatures.args = {
  features: gameFeaturesFixtures.threeFeatures,
  onSubmit: action("onSubmit"),
};
