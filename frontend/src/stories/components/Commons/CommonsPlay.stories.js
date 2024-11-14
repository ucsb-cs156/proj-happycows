import CommonsPlay from "main/components/Commons/CommonsPlay";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

export default {
  title: "components/Commons/CommonsPlay",
  component: CommonsPlay,
};

export const Uncontrolled = {
  render: () => <CommonsPlay currentUser={currentUserFixtures.adminUser} />,
  name: "uncontrolled",
};
