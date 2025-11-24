import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

function RecordCommonStatsForm({ submitAction }) {
  const { handleSubmit } = useForm();

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <p>Click this button to generate a record of common stats!</p>
      <Button type="submit" data-testid="RecordCommonStats-Submit-Button">
        Generate
      </Button>
    </Form>
  );
}
export default RecordCommonStatsForm;
