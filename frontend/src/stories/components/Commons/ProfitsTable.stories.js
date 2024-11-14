import ProfitsTable from "main/components/Commons/ProfitsTable";

export default {
  title: "components/Commons/ProfitsTable",
  component: ProfitsTable,
};

export const Emptytable = {
  render: () => <ProfitsTable profits={[]} />,
  name: "emptytable",
};

export const BadInput = {
  render: () => <ProfitsTable profits={["stryker-was-here"]} />,
  name: "bad-input",
};
