import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

function RecordCommonStatsJobForm({ submitAction }) {
  const { handleSubmit } = useForm();

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <p>Click this button to record common stats!</p>
      <Button type="submit" data-testid="RecordCommonStatsForm-Submit-Button">
        Record Stats
      </Button>
    </Form>
  );
}
export default RecordCommonStatsJobForm;