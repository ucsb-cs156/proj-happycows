import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

function RecordGameStatsForm({
  submitAction = () => {},
  testid = "RecordGameStatsForm",
}) {
  const { handleSubmit } = useForm(); //wraps form submission to handle the form data
  return (
    <Form onSubmit={handleSubmit(submitAction)} data-testid={testid}>
      <Form.Group className="mb-3">
        <Form.Text>
          Record statistics for all games. This will create a GameStats record
          for each game with current health and profit data.
        </Form.Text>
      </Form.Group>
      <Button type="submit" data-testid="RecordGameStatsForm-Submit-Button">
        Record Stats
      </Button>
    </Form>
  );
}

export default RecordGameStatsForm;
