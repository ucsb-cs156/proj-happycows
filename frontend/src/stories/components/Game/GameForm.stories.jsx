import React from "react";

import { action } from "storybook/actions";
import GameForm from "main/components/Game/GameForm";

export default {
  title: "components/Game/GameForm",
  component: GameForm,
};

const Template = (args) => {
  return <GameForm {...args} />;
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
  submitAction: action("submit"),
};
