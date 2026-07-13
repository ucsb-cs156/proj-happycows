import { Form } from "react-bootstrap";
import { useBackend } from "main/utils/useBackend";

// A dropdown for selecting a School, backed by /api/course/schools, which
// only returns "active" schools (see the School enum on the backend). New
// schools become selectable here automatically once marked active there,
// with no frontend changes required (see issue #251).
function SchoolSelectDropdown({
  initialValue,
  register,
  testIdPrefix = "SchoolSelectDropdown",
}) {
  // Stryker disable all
  const { data: schools } = useBackend(["/api/course/schools"], {
    method: "GET",
    url: "/api/course/schools",
  });
  // Stryker restore all

  return (
    <Form.Group className="mb-3">
      <Form.Label htmlFor="school">School</Form.Label>
      {schools && (
        <Form.Select
          data-testid={`${testIdPrefix}-school`}
          id="school"
          {...register("school", {
            required: "School is required.",
          })}
          // Stryker disable next-line StringLiteral : there is no option
          // with an empty value here, so any non-matching fallback string
          // is behaviorally equivalent to "" (the browser just selects the
          // first option either way).
          defaultValue={initialValue ?? ""}
        >
          {schools.map((school) => (
            <option
              key={school.key}
              value={school.key}
              data-testid={`${testIdPrefix}-school-${school.key}`}
            >
              {school.displayName}
            </option>
          ))}
        </Form.Select>
      )}
    </Form.Group>
  );
}

export default SchoolSelectDropdown;
