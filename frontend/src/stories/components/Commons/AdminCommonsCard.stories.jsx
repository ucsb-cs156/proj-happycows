import React from "react";

import commonsFixtures from "fixtures/commonsFixtures";
import AdminCommonsCard from "main/components/Commons/AdminCommonsCard";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import commonsPlusFixtures from "fixtures/commonsPlusFixtures";

export default {
  title: "components/Commons/AdminCommonsCard",
  component: AdminCommonsCard,
};

const Template = (args) => {
  return <AdminCommonsCard {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  commonItem: commonsPlusFixtures.threeCommonsPlus[0],
  currentUser: currentUserFixtures.adminUser,
};
