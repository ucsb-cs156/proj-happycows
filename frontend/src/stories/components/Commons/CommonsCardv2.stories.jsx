import React from "react";

import commonsFixtures from "fixtures/commonsFixtures";
import CommonsCardv2 from "main/components/Commons/CommonsCardv2";

export default {
  title: "components/Commons/CommonsCardv2",
  component: CommonsCardv2,
};

const Template = (args) => {
  return <CommonsCardv2 {...args} />;
};

export const NullButton = Template.bind({});

NullButton.args = {
  commons: commonsFixtures.threeCommons[0],
  buttonText: null,
};

export const TextButton = Template.bind({});

TextButton.args = {
  commons: commonsFixtures.threeCommons[0],
  buttonText: "Join",
};
