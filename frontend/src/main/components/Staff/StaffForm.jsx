import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

// A course-scoped form for adding/editing a single staff member. courseId
// is not a field on this form: the caller (a course's own admin page)
// already knows which course it's operating on, and merges courseId into
// the submitted data itself (see StaffTabComponent). See issue #251.
function StaffForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
  cancelDisabled = false,
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all

  const navigate = useNavigate();

  const testIdPrefix = "StaffForm";

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      {initialContents?.id != null && (
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
        <Form.Label htmlFor="lastName">Last Name</Form.Label>
        <Form.Control
          // Stryker disable next-line all
          data-testid={testIdPrefix + "-lastName"}
          id="lastName"
          type="text"
          isInvalid={Boolean(errors.lastName)}
          {...register("lastName", {
            required: "Last name is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.lastName && "Last name is required."}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="firstMiddleName">First/Middle Name</Form.Label>
        <Form.Control
          // Stryker disable next-line all
          data-testid={testIdPrefix + "-firstMiddleName"}
          id="firstMiddleName"
          type="text"
          isInvalid={Boolean(errors.firstMiddleName)}
          {...register("firstMiddleName", {
            required: "First/Middle name is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.firstMiddleName && "First/Middle name is required."}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="email">Email</Form.Label>
        <Form.Control
          // Stryker disable next-line all
          data-testid={testIdPrefix + "-email"}
          id="email"
          type="text"
          isInvalid={Boolean(errors.email)}
          {...register("email", {
            required: "Email is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.email && "Email is required."}
        </Form.Control.Feedback>
      </Form.Group>

      <Button
        type="submit"
        // Stryker disable next-line all
        data-testid={testIdPrefix + "-submit"}
      >
        {buttonLabel}
      </Button>
      {!cancelDisabled && (
        <Button
          variant="Secondary"
          onClick={() => navigate(-1)}
          // Stryker disable next-line all
          data-testid={testIdPrefix + "-cancel"}
        >
          Cancel
        </Button>
      )}
    </Form>
  );
}

export default StaffForm;
