import React from "react";

import commonsFixtures from "fixtures/commonsFixtures";
import CommonsCard from "main/components/Commons/CommonsCard";

export default {
  title: "components/Commons/CommonsCard",
  component: CommonsCard,
};

const Template = (args) => {
  return <CommonsCard {...args} />;
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
