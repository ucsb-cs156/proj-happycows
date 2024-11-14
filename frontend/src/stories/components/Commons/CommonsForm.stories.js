import { action } from "@storybook/addon-actions";
import CommonsForm from "main/components/Commons/CommonsForm";

export default {
  title: "components/Commons/CommonsForm",
  component: CommonsForm,
};

export const Uncontrolled = {
  render: () => <CommonsForm submitAction={action("submit")} />,
  name: "uncontrolled",
};
