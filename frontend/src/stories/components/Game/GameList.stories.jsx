import React from "react";

import gameFixtures from "fixtures/gameFixtures";
import GameList from "main/components/Game/GameList";

export default {
  title: "components/Game/GameList",
  component: GameList,
};

const Template = (args) => {
  return <GameList {...args} />;
};

export const NullButton = Template.bind({});

NullButton.args = {
  commonList: gameFixtures.threeGame,
  buttonText: null,
};

export const TextButton = Template.bind({});

TextButton.args = {
  commonList: gameFixtures.threeGame,
  buttonText: "Join",
};
