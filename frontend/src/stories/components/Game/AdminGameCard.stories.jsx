import React from "react";

import AdminGameCard from "main/components/Game/AdminGameCard";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import gamePlusFixtures from "fixtures/gamePlusFixtures";

export default {
  title: "components/Game/AdminGameCard",
  component: AdminGameCard,
};

const Template = (args) => {
  return <AdminGameCard {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  commonItem: gamePlusFixtures.threeGamePlus[0],
  currentUser: currentUserFixtures.adminUser,
};
