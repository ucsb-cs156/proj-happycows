import { action } from "@storybook/addon-actions";
import UpdateCowHealthForm from "main/components/Jobs/UpdateCowHealthForm";

export default {
  title: "components/Jobs/UpdateCowHealthForm",
  component: UpdateCowHealthForm,
};

export const Uncontrolled = {
  render: () => <UpdateCowHealthForm submitAction={action("submit")} />,
  name: "uncontrolled",
};
