import React from "react";
import CommonsCard from "./CommonsCard";
import { Card, Container, Row, Col } from "react-bootstrap";

const CommonsList = (props) => {
    const defaultMessage = props.title?.includes("Join") ? "join" : "visit";

    return (
        <Card
            style={
                // Stryker disable next-line all: don't test CSS params
                { background: 'rgba(255, 255, 255, 0.7)', 
                    borderRadius: '10px', 
                    padding: '10px', 
                    backdropFilter: 'blur(10px)', 
                    WebkitBackdropFilter: 'blur(10px)'}
            }
            className="my-3 border-0"
        >
            <Card.Title
                data-testid="commonsList-title"
                style={
                    // Stryker disable next-line all: don't test CSS params
                    { fontSize: "35px",
                    fontWeight: "bold",
                    color: "#1E4D2B"
                    }
                }
                className="text-center my-3"
            >
                {props.title}
            </Card.Title>
            {props.commonList.length > 0 ? 
            <React.Fragment>
                <Card.Subtitle>
                    <Container>
                        <Row>
                            <Col data-testid="commonsList-subtitle-id" sx={4}>ID#</Col>
                            <Col data-testid="commonsList-subtitle-name" sx={4}>Common's Name</Col>
                            <Col sm={4}></Col>
                        </Row>
                    </Container>
                </Card.Subtitle>
                {
                    props.commonList.map(
                        (c) => (<CommonsCard key={c.id} commons={c} buttonText={props.buttonText} buttonLink={props.buttonLink} />)
                    )
                }
            </React.Fragment> 
            : 
            <Card.Subtitle>
                <Container>
                    <Row style={{justifyContent: "center"}} data-testid="commonsList-default-message">
                        There are currently no commons to {defaultMessage}
                    </Row>
                </Container>
            </Card.Subtitle>
        }
        </Card>
    );
};

export default CommonsList;