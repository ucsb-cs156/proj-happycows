import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

function UpdateCowHealthJobForm({ submitAction }) {


  // Stryker disable all
  const {
    handleSubmit,
  } = useForm(
  );

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Button type="submit" data-testid="UpdateCowHealthJobForm-Submit-Button">Submit</Button>
    </Form>
  );
}

export default UpdateCowHealthJobForm;