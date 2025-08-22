import React from "react";

import { action } from "storybook/actions";
import ManageCows from "main/components/Commons/ManageCows";
import commonsFixtures from "fixtures/commonsFixtures";
import userCommonsFixtures from "fixtures/userCommonsFixtures";

export default {
  title: "components/Commons/ManageCows",
  component: ManageCows,
};

const Template = (args) => {
  return <ManageCows {...args} />;
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
  commons: commonsFixtures.oneCommons[0],
  userCommons: userCommonsFixtures.oneUserCommons[0],
  onBuy: action("onBuy"),
  onSell: action("onSell"),
};
