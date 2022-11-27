import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

function InstructorReportJobForm({ submitAction }) {
const defaultValues = {
};
const {
  //register,
  //formState: { errors },
  handleSubmit,
} = useForm(
  { defaultValues: defaultValues }
);
// Stryker enable all
return (
  <Form onSubmit={handleSubmit(submitAction)}>

      <Button type="submit" data-testid="InstructorReportJobForm-Submit-Button">Submit</Button>
    </Form>
  );
}

export default InstructorReportJobForm;
