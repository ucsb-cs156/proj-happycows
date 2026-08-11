import React from "react";

import GamePlay from "main/components/Game/GamePlay";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

export default {
  title: "components/Game/GamePlay",
  component: GamePlay,
};

const Template = (args) => {
  return <GamePlay {...args} />;
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
  currentUser: currentUserFixtures.adminUser,
};
