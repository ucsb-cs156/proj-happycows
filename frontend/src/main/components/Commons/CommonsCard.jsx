import React from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";

const curr = new Date();

function toDateKey(dateOrString) {
  if (!dateOrString) return "";
  if (typeof dateOrString === "string") {
    return dateOrString.substring(0, 10);
  }
  const year = dateOrString.getFullYear();
  const month = String(dateOrString.getMonth() + 1).padStart(2, "0");
  const day = String(dateOrString.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isFutureDate(startingDate, currentDate = curr) {
  const targetKey = toDateKey(startingDate);
  const referenceKey = toDateKey(currentDate);
  if (!targetKey || !referenceKey) return false;
  return targetKey > referenceKey;
}

const CommonsCard = ({ buttonText, buttonLink, commons }) => {
  const testIdPrefix = "commonsCard";
  return (
    <Card.Body className="woodenboardtable">
      <Container>
        <Row>
          <Col sx={4} data-testid={`${testIdPrefix}-id-${commons.id}`}>
            {commons.id}
          </Col>
          <Col sx={4} data-testid={`${testIdPrefix}-name-${commons.id}`}>
            {commons.name}
          </Col>
          {buttonText != null && (
            <Col sm={4}>
              <Button
                data-testid={`${testIdPrefix}-button-${buttonText}-${commons.id}`}
                size="sm"
                className="buttonchange"
                onClick={() => {
                  if (
                    buttonText === "Join" &&
                    isFutureDate(commons.startingDate)
                  ) {
                    // Stryker disable all: unable to read alert text in tests
                    alert(
                      "This commons has not started yet and cannot be joined.\nThe starting date is " +
                        parseInt(commons.startingDate.substring(5, 7)) +
                        "/" +
                        parseInt(commons.startingDate.substring(8, 10)) +
                        "/" +
                        parseInt(commons.startingDate),
                    );
                    // Stryker restore all
                  } else {
                    buttonLink(commons.id);
                  }
                }}
              >
                {buttonText}
              </Button>
            </Col>
          )}
        </Row>
      </Container>
    </Card.Body>
  );
};

export default CommonsCard;
