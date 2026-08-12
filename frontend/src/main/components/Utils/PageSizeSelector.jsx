import React from "react";
import { Form } from "react-bootstrap";

export default function PageSizeSelector({
  value,
  onChange,
  options = [20, 50, 100, 200, 500],
  testid = "page-size-selector",
}) {
  const handleChange = (e) => {
    onChange(parseInt(e.target.value, 10));
  };

  return (
    <Form.Group className="d-flex align-items-center gap-2 mt-2">
      <Form.Label htmlFor="pageSize" className="mb-0">
        Page Size
      </Form.Label>
      <Form.Select
        id="pageSize"
        data-testid={testid}
        value={value}
        onChange={handleChange}
        // Stryker disable next-line all : this is for styling, which is unnecessary to test
        style={{ width: "100px" }}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            data-testid={`${testid}-option-${option}`}
          >
            {option}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
}
