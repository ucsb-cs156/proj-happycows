import CommonsOverview from "main/components/Commons/CommonsOverview";
import commonsPlusFixtures from "fixtures/commonsPlusFixtures";

export default {
  title: "components/Commons/CommonsOverview",
  component: CommonsOverview,
};

export const Uncontrolled = {
  render: () => (
    <CommonsOverview commonsPlus={commonsPlusFixtures.oneCommonsPlus[0]} />
  ),
  name: "uncontrolled",
};
