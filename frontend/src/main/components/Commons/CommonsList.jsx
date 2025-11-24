import React from "react";
import CommonsCard from "./CommonsCard";
import { Card, Container, Row, Col } from "react-bootstrap";

const CommonsList = (props) => {
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
        data-testid="commonsList-title"
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
                  data-testid="commonsList-subtitle-id"
                  sx={4}
                  style={
                    // Stryker disable next-line all: don't test CSS params
                    { fontFamily: "Sancreek", paddingBottom: "10px" }
                  }
                >
                  ID#
                </Col>
                <Col
                  data-testid="commonsList-subtitle-name"
                  sx={4}
                  style={
                    // Stryker disable next-line all: don't test CSS params
                    { fontFamily: "Sancreek", paddingBottom: "10px" }
                  }
                >
                  Common&apos;s Name
                </Col>
                <Col sm={4}></Col>
              </Row>
            </Container>
          </Card.Subtitle>
          {props.commonList.map((c) => (
            <CommonsCard
              key={c.id}
              commons={c}
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
              data-testid="commonsList-default-message"
            >
              There are currently no commons to {defaultMessage}
            </Row>
          </Container>
        </Card.Subtitle>
      )}
    </Card>
  );
};

export default CommonsList;
