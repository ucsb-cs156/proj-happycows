import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function CommonsFeaturesForm({
  features = {},
  onSubmit,
  buttonLabel = "Save",
}) {
  const [localFeatures, setLocalFeatures] = useState({});

  useEffect(() => {
    setLocalFeatures({ ...features });
  }, [features]);

  const handleCheckboxChange = (featureName) => {
    setLocalFeatures((prev) => ({
      ...prev,
      [featureName]: !prev[featureName],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(localFeatures);
    }
  };

  const formatFeatureName = (featureName) => {
    return featureName
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        {Object.keys(localFeatures).map((featureName) => (
          <Col key={featureName} md={6} className="mb-3">
            <Form.Group>
              <Form.Check
                type="checkbox"
                id={featureName}
                label={formatFeatureName(featureName)}
                checked={localFeatures[featureName] || false}
                onChange={() => handleCheckboxChange(featureName)}
                data-testid={`CommonsFeaturesForm-${featureName}`}
              />
            </Form.Group>
          </Col>
        ))}
      </Row>
      <Row>
        <Col>
          <Button
            type="submit"
            variant="primary"
            data-testid="CommonsFeaturesForm-Submit-Button"
          >
            {buttonLabel}
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
