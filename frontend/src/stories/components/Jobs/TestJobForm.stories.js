import { action } from "@storybook/addon-actions";
import TestJobForm from "main/components/Jobs/TestJobForm";

export default {
  title: "components/Jobs/TestJobForm",
  component: TestJobForm,
};

export const Uncontrolled = {
  render: () => <TestJobForm submitAction={action("submit")} />,
  name: "uncontrolled",
};
