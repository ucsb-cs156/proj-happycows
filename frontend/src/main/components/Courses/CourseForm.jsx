import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function CourseForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all

  const navigate = useNavigate();

  const testIdPrefix = "CourseForm";

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      {initialContents && (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="id">Id</Form.Label>
          <Form.Control
            // Stryker disable next-line all
            data-testid={testIdPrefix + "-id"}
            id="id"
            type="text"
            {...register("id")}
            value={initialContents.id}
            disabled
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label htmlFor="code">Code</Form.Label>
        <Form.Control
          // Stryker disable next-line all
          data-testid={testIdPrefix + "-code"}
          id="code"
          type="text"
          isInvalid={Boolean(errors.code)}
          {...register("code", {
            required: "Code is required.",
            maxLength: {
              value: 30,
              message: "Code max length 30 characters",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.code?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="name">Name</Form.Label>
        <Form.Control
          // Stryker disable next-line all
          data-testid={testIdPrefix + "-name"}
          id="name"
          type="text"
          isInvalid={Boolean(errors.name)}
          // Stryker disable next-line all
          {...register("name", {
            required: "Name is required.",
            maxLength: {
              value: 100,
              message: "Name max length 100 characters",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.name?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="term">Term</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-term"}
          id="term"
          type="text"
          isInvalid={Boolean(errors.term)}
          {...register("term", {
            required: "Term is required.",
            maxLength: {
              value: 10,
              message: "Term max length 10 characters",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.term?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Button
        type="submit"
        // Stryker disable next-line all
        data-testid={testIdPrefix + "-submit"}
      >
        {buttonLabel}
      </Button>
      <Button
        variant="Secondary"
        onClick={() => navigate(-1)}
        // Stryker disable next-line all
        data-testid={testIdPrefix + "-cancel"}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default CourseForm;
