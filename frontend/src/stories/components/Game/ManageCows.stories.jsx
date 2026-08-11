import React from "react";

import { action } from "storybook/actions";
import ManageCows from "main/components/Game/ManageCows";
import gameFixtures from "fixtures/gameFixtures";
import farmerFixtures from "fixtures/farmerFixtures";

export default {
  title: "components/Game/ManageCows",
  component: ManageCows,
};

const Template = (args) => {
  return <ManageCows {...args} />;
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
  game: gameFixtures.oneGame[0],
  farmer: farmerFixtures.oneFarmer[0],
  onBuy: action("onBuy"),
  onSell: action("onSell"),
};
