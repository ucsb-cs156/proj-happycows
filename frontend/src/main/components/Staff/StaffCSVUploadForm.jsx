import { useForm } from "react-hook-form";
import { Button, Form } from "react-bootstrap";

export default function StaffCSVUploadForm({ submitAction }) {
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
        <Form.Label htmlFor="upload">Upload Staff Roster (.csv)</Form.Label>
        <Form.Control
          data-testid="StaffCSVUploadForm-upload"
          id="upload"
          type="file"
          accept=".csv"
          isInvalid={Boolean(errors.upload)}
          {...register("upload", {
            validate: (files) =>
              (files && files.length > 0) || "A CSV file is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.upload?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Button
        type="submit"
        data-testid="StaffCSVUploadForm-submit"
        className="mt-3"
      >
        Upload
      </Button>
    </Form>
  );
}
