import React from "react";

import GameOverview from "main/components/Game/GameOverview";
import gamePlusFixtures from "fixtures/gamePlusFixtures";

export default {
  title: "components/Game/GameOverview",
  component: GameOverview,
};

const Template = (args) => {
  return <GameOverview {...args} />;
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
  gamePlus: gamePlusFixtures.oneGamePlus[0],
};
