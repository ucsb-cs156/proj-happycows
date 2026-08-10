import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

function RecordCommonStatsForm({
  submitAction = () => {},
  testid = "RecordCommonStatsForm",
}) {
  const { handleSubmit } = useForm(); //wraps form submission to handle the form data
  return (
    <Form onSubmit={handleSubmit(submitAction)} data-testid={testid}>
      <Form.Group className="mb-3">
        <Form.Text>
          Record statistics for all games. This will create a CommonStats record
          for each game with current health and profit data.
        </Form.Text>
      </Form.Group>
      <Button type="submit" data-testid="RecordCommonStatsForm-Submit-Button">
        Record Stats
      </Button>
    </Form>
  );
}

export default RecordCommonStatsForm;
