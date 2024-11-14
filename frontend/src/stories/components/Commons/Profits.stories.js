import Profits from "main/components/Commons/Profits";
import userCommonsFixtures from "fixtures/userCommonsFixtures";

export default {
  title: "components/Commons/Profits",
  component: Profits,
};

export const Uncontrolled = {
  render: () => <Profits userCommons={userCommonsFixtures.oneUserCommons[0]} />,
  name: "uncontrolled",
};
