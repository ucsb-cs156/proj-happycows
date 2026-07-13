import { useForm } from "react-hook-form";
import { Button, Form } from "react-bootstrap";

export default function StudentsCSVUploadForm({ submitAction }) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();
  // Stryker restore all

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Form.Group className="mb-2">
        <Form.Label htmlFor="upload">Upload Student Roster (.csv)</Form.Label>
        <Form.Control
          data-testid="StudentsCSVUploadForm-upload"
          id="upload"
          type="file"
          accept=".csv"
          isInvalid={Boolean(errors.upload)}
          {...register("upload", {
            validate: (files) => (files && files.length > 0) || "required",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.upload && "A CSV file is required."}
        </Form.Control.Feedback>
      </Form.Group>
      <Button
        type="submit"
        data-testid="StudentsCSVUploadForm-submit"
        className="mt-3"
      >
        Upload
      </Button>
    </Form>
  );
}
