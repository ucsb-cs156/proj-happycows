import React from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import { isFutureDate } from "./gameCardUtils";

const GameCard = ({ buttonText, buttonLink, game }) => {
  const testIdPrefix = "gameCard";
  return (
    <Card.Body className="woodenboardtable">
      <Container>
        <Row>
          <Col sx={4} data-testid={`${testIdPrefix}-id-${game.id}`}>
            {game.id}
          </Col>
          <Col sx={4} data-testid={`${testIdPrefix}-name-${game.id}`}>
            {game.name}
          </Col>
          {buttonText != null && (
            <Col sm={4}>
              <Button
                data-testid={`${testIdPrefix}-button-${buttonText}-${game.id}`}
                size="sm"
                className="buttonchange"
                onClick={() => {
                  if (
                    buttonText === "Join" &&
                    isFutureDate(game.startingDate)
                  ) {
                    // Stryker disable all: unable to read alert text in tests
                    alert(
                      "This game has not started yet and cannot be joined.\nThe starting date is " +
                        parseInt(game.startingDate.substring(5, 7)) +
                        "/" +
                        parseInt(game.startingDate.substring(8, 10)) +
                        "/" +
                        parseInt(game.startingDate),
                    );
                    // Stryker restore all
                  } else {
                    buttonLink(game.id);
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

export default GameCard;
