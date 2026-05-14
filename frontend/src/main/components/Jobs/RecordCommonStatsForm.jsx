import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

function RecordCommonStatsForm({ 
  submitAction = () => {},
  testid = "RecordCommonStatsForm",
 }) {
  const { handleSubmit } = useForm(); //wraps form submission to handle the form data 
  const onSubmit = (data) => { //create handler function
    submitAction(data)
  };
  return (
    <Form onSubmit={handleSubmit(onSubmit)} data-testid={testid}>
      <Button type="submit" data-testid="RecordCommonStatsForm-Submit-Button">Record Stats</Button>
    </Form>
  )
}

export default RecordCommonStatsForm;