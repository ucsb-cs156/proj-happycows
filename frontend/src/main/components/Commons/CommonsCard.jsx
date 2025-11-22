import React from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import { isFutureDate } from "./commonsCardUtils";

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
