import ManageCows from "main/components/Commons/ManageCows";
import commonsFixtures from "fixtures/commonsFixtures";
import userCommonsFixtures from "fixtures/userCommonsFixtures";

export default {
  title: "components/Commons/ManageCows",
  component: ManageCows,
};

export const Uncontrolled = {
  render: () => (
    <ManageCows
      commons={commonsFixtures.oneCommons[0]}
      userCommons={userCommonsFixtures.oneUserCommons[0]}
      onBuy={(userCommons) => {
        console.log("onBuy called:", userCommons);
      }}
      onSell={(userCommons) => {
        console.log("onSell called:", userCommons);
      }}
    />
  ),

  name: "uncontrolled",
};
