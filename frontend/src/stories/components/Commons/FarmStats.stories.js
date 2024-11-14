import FarmStats from "main/components/Commons/FarmStats";
import userCommonsFixtures from "fixtures/userCommonsFixtures";

export default {
  title: "components/Commons/FarmStats",
  component: FarmStats,
};

export const Uncontrolled = {
  render: () => (
    <FarmStats userCommons={userCommonsFixtures.oneUserCommons[0]} />
  ),
  name: "uncontrolled",
};
