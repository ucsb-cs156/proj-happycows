import { Form } from "react-bootstrap";
import { useBackend } from "main/utils/useBackend";

// A dropdown for selecting a Course, backed by /api/course/all.
// When includeNoCourseOption is true, a "No Course" option is added at the
// top, and the field is optional; its value is submitted as null (see
// issue #251).
function CourseSelectDropdown({
  formName = "courseId",
  displayName = "Course",
  initialValue,
  register,
  includeNoCourseOption = false,
  testIdPrefix = "CourseSelectDropdown",
}) {
  // Stryker disable all
  const { data: courses } = useBackend(
    ["/api/course/all"],
    { method: "GET", url: "/api/course/all" },
    [],
  );
  // Stryker restore all

  return (
    <Form.Group className="mb-3">
      <Form.Label htmlFor={formName}>{displayName}</Form.Label>
      <Form.Select
        data-testid={`${testIdPrefix}-${formName}`}
        id={formName}
        {...register(formName, {
          required: includeNoCourseOption ? false : "Course is required.",
          setValueAs: (value) => (value === "" ? null : Number(value)),
        })}
        defaultValue={initialValue ?? ""}
      >
        {includeNoCourseOption && (
          <option value="" data-testid={`${testIdPrefix}-${formName}-none`}>
            No Course
          </option>
        )}
        {Array.isArray(courses) &&
          courses.map((course) => (
            <option
              key={course.id}
              value={course.id}
              data-testid={`${testIdPrefix}-${formName}-${course.id}`}
            >
              {course.code} - {course.name} ({course.term})
            </option>
          ))}
      </Form.Select>
    </Form.Group>
  );
}

export default CourseSelectDropdown;
