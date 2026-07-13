import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import CourseSelectDropdown from "main/components/Courses/CourseSelectDropdown";

function StudentsForm({
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

  const testIdPrefix = "StudentsForm";

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

      <Form.Group className="mb-3">
        <Form.Label htmlFor="perm">Perm Number</Form.Label>
        <Form.Control
          // Stryker disable next-line all
          data-testid={testIdPrefix + "-perm"}
          id="perm"
          type="text"
          isInvalid={Boolean(errors.perm)}
          {...register("perm", {
            required: "Perm number is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.perm && "Perm number is required."}
        </Form.Control.Feedback>
      </Form.Group>

      <CourseSelectDropdown
        formName="courseId"
        displayName="Course"
        initialValue={initialContents?.courseId}
        register={register}
        testIdPrefix={testIdPrefix}
      />
      {errors.courseId && (
        <p className="text-danger">{errors.courseId.message}</p>
      )}

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

export default StudentsForm;
