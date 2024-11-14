import commonsFixtures from "fixtures/commonsFixtures";
import CommonsList from "main/components/Commons/CommonsList";

export default {
  title: "components/Commons/CommonsList",
  component: CommonsList,
};

export const NullButton = {
  render: () => (
    <CommonsList commonList={commonsFixtures.threeCommons} buttonText={null} />
  ),
  name: "nullButton",
};

export const TextButton = {
  render: () => (
    <CommonsList
      commonList={commonsFixtures.threeCommons}
      buttonText={"Join"}
    />
  ),
  name: "textButton",
};
