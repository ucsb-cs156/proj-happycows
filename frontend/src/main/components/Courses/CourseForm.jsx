import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function CourseForm({
  initialCourse,
  submitAction,
  buttonLabel = "Create",
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialCourse || {} });

  const navigate = useNavigate();
  const testIdPrefix = "CourseForm";

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      {initialCourse && (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="id">Id</Form.Label>
          <Form.Control
            data-testid={`${testIdPrefix}-id`}
            id="id"
            type="text"
            {...register("id")}
            value={initialCourse.id}
            disabled
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label htmlFor="code">Course Code</Form.Label>
        <Form.Control
          data-testid={`${testIdPrefix}-code`}
          id="code"
          type="text"
          isInvalid={Boolean(errors.code)}
          {...register("code", {
            required: "Course code is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.code?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="name">Course Name</Form.Label>
        <Form.Control
          data-testid={`${testIdPrefix}-name`}
          id="name"
          type="text"
          isInvalid={Boolean(errors.name)}
          {...register("name", {
            required: "Course name is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.name?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="term">Term</Form.Label>
        <Form.Control
          data-testid={`${testIdPrefix}-term`}
          id="term"
          type="text"
          isInvalid={Boolean(errors.term)}
          {...register("term", {
            required: "Term is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.term?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Button type="submit" data-testid={`${testIdPrefix}-submit`}>
        {buttonLabel}
      </Button>
      <Button
        variant="Secondary"
        onClick={() => navigate(-1)}
        data-testid={`${testIdPrefix}-cancel`}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default CourseForm;
