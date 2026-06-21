import React from "react";
import { Form } from "react-bootstrap";

export default function BinSizeSelector({
  value,
  onChange,
  testid = "bin-size-selector",
}) {
  const handleChange = (e) => {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      onChange(parsed);
    }
  };

  return (
    <Form.Group className="d-flex align-items-center gap-2 mt-2">
      <Form.Label htmlFor="binSize" className="mb-0">
        Bin Size
      </Form.Label>
      <Form.Control
        id="binSize"
        data-testid={testid}
        type="number"
        min="1"
        step="1"
        value={value}
        onChange={handleChange}
        style={{ width: "100px" }}
      />
    </Form.Group>
  );
}
