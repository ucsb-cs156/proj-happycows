import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

function UpdateCowHealthJobForm({ submitAction }) {

 const defaultValues = {
    // Stryker disable next-line all
};

  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm(
    { defaultValues: defaultValues }
  );
  // Stryker enable all

  const testid = "UpdateCowHealthJobForm";

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Button type="submit" data-testid="UpdateCowHealthJobForm-Submit-Button">Submit</Button>
    </Form>
  );
}

export default UpdateCowHealthJobForm;