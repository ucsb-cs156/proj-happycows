import React from "react";

import Profits from "main/components/Commons/Profits";
import farmerFixtures from "fixtures/farmerFixtures";

export default {
  title: "components/Commons/Profits",
  component: Profits,
};

const Template = (args) => {
  return <Profits {...args} />;
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
  farmer: farmerFixtures.oneFarmer[0],
};
