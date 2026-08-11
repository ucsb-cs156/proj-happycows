import React from "react";

import ProfitsTable from "main/components/Game/ProfitsTable";

export default {
  title: "components/Game/ProfitsTable",
  component: ProfitsTable,
};

const Template = (args) => {
  return <ProfitsTable {...args} />;
};

export const Emptytable = Template.bind({});

Emptytable.args = {
  profits: [],
};
