import React from "react";

import FarmStats from "main/components/Game/FarmStats";
import farmerFixtures from "fixtures/farmerFixtures";

export default {
  title: "components/Game/FarmStats",
  component: FarmStats,
};

const Template = (args) => {
  return <FarmStats {...args} />;
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
  farmer: farmerFixtures.oneFarmer[0],
};
