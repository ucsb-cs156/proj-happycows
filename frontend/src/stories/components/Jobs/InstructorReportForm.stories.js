import { action } from "@storybook/addon-actions";
import InstructorReportForm from "main/components/Jobs/InstructorReportForm";

export default {
  title: "components/Jobs/InstructorReportForm",
  component: InstructorReportForm,
};

export const Uncontrolled = {
  render: () => <InstructorReportForm submitAction={action("submit")} />,
  name: "uncontrolled",
};
