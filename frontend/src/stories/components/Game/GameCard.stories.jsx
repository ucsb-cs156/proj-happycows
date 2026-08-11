import React from "react";

import gameFixtures from "fixtures/gameFixtures";
import GameCard from "main/components/Game/GameCard";

export default {
  title: "components/Game/GameCard",
  component: GameCard,
};

const Template = (args) => {
  return <GameCard {...args} />;
};

export const NullButton = Template.bind({});

NullButton.args = {
  game: gameFixtures.threeGame[0],
  buttonText: null,
};

export const TextButton = Template.bind({});

TextButton.args = {
  game: gameFixtures.threeGame[0],
  buttonText: "Join",
};
