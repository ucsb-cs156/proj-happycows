import React from "react";

import FarmStats from "main/components/Commons/FarmStats";
import farmerFixtures from "fixtures/farmerFixtures";

export default {
  title: "components/Commons/FarmStats",
  component: FarmStats,
};

const Template = (args) => {
  return <FarmStats {...args} />;
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
  farmer: farmerFixtures.oneFarmer[0],
};
