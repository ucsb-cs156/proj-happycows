import commonsFixtures from "fixtures/commonsFixtures";
import CommonsCard from "main/components/Commons/CommonsCard";

export default {
  title: "components/Commons/CommonsCard",
  component: CommonsCard,
};

export const NullButton = {
  render: () => (
    <CommonsCard commons={commonsFixtures.threeCommons[0]} buttonText={null} />
  ),
  name: "nullButton",
};

export const TextButton = {
  render: () => (
    <CommonsCard
      commons={commonsFixtures.threeCommons[0]}
      buttonText={"Join"}
    />
  ),
  name: "textButton",
};
