import React from "react";

import ProfitsTable from "main/components/Commons/ProfitsTable";

export default {
  title: "components/Commons/ProfitsTable",
  component: ProfitsTable,
};

const Template = (args) => {
  return <ProfitsTable {...args} />;
};

export const Emptytable = Template.bind({});

Emptytable.args = {
  profits: [],
};
