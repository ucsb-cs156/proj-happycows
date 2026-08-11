import React from "react";
import GameCard from "./GameCard";
import { Card, Container, Row, Col } from "react-bootstrap";

const GameList = (props) => {
  const defaultMessage = props.title?.includes("Join") ? "join" : "visit";

  return (
    <Card
      style={
        // Stryker disable all: don't test CSS params
        {
          opacity: "1",
          backgroundColor: "rgb(147,98,66)",
          color: "rgb(245, 210, 140)",
          border: "6px solid rgb(99,71,52)",
        }
      }
      // Stryker restore all
      className="my-3"
    >
      <Card.Title
        data-testid="gameList-title"
        style={
          // Stryker disable all: don't test CSS params
          {
            fontFamily: "Rye",
            fontSize: "35px",
            backgroundColor: "rgb(147,98,66)",
            color: "rgb(245, 210, 140)",
          }
        }
        // Stryker restore all
        className="text-center my-3"
      >
        {props.title}
      </Card.Title>
      {props.commonList.length > 0 ? (
        <React.Fragment>
          <Card.Subtitle>
            <Container>
              <Row>
                <Col
                  data-testid="gameList-subtitle-id"
                  sx={4}
                  style={
                    // Stryker disable next-line all: don't test CSS params
                    { fontFamily: "Sancreek", paddingBottom: "10px" }
                  }
                >
                  ID#
                </Col>
                <Col
                  data-testid="gameList-subtitle-name"
                  sx={4}
                  style={
                    // Stryker disable next-line all: don't test CSS params
                    { fontFamily: "Sancreek", paddingBottom: "10px" }
                  }
                >
                  Game Name
                </Col>
                <Col sm={4}></Col>
              </Row>
            </Container>
          </Card.Subtitle>
          {props.commonList.map((c) => (
            <GameCard
              key={c.id}
              game={c}
              buttonText={props.buttonText}
              buttonLink={props.buttonLink}
            />
          ))}
        </React.Fragment>
      ) : (
        <Card.Subtitle>
          <Container>
            <Row
              style={
                // Stryker disable all: don't test CSS params
                {
                  justifyContent: "center",
                  fontFamily: "Sancreek",
                  paddingBottom: "10px",
                }
                // Stryker restore all
              }
              data-testid="gameList-default-message"
            >
              There are currently no games to {defaultMessage}
            </Row>
          </Container>
        </Card.Subtitle>
      )}
    </Card>
  );
};

export default GameList;
