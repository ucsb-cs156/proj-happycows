import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

function MilkCowsJobForm(submitAction) {
  const defaultValues = {
    fail: false,
    sleepMs: 1000
};
  // Stryker disable all
  const {
    handleSubmit,
  } = useForm(
    { defaultValues: defaultValues }
  );
  // Stryker enable all

  return(
    <Form onSubmit={handleSubmit(submitAction)}>
      <Button type="submit" data-testid="MilkCowsForm-Submit-Button">Submit</Button>
    </Form>
  );

}
export default MilkCowsJobForm;