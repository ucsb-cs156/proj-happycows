import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

function MilkTheCowsJobForm({ submitAction }) {
  const {
    //register,
    //formState: { errors },
    handleSubmit,
  } = useForm(
  );
  // Stryker enable all
  return (
    <Form onSubmit={handleSubmit(submitAction)}>
  
        <Button type="submit" data-testid="MilkTheCowsJobForm-Submit-Button">Submit</Button>
      </Form>
    );
  }

  export default MilkTheCowsJobForm;
