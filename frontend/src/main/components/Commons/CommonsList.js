import React from "react";
import CommonsCard from "./CommonsCard";
import { Card, Container, Row, Col } from "react-bootstrap";

const CommonsList = (props) => {
    // Stryker disable all: don't test removing colors
    const cardColors = [
        "rgba(255, 215, 0, 0.5)",     // Gold
        "rgba(255, 160, 122, 0.5)",   // Light Salmon
        "rgba(32, 178, 170, 0.5)",    // Light Sea Green
        "rgba(135, 206, 250, 0.5)",   // Light Sky Blue
        "rgba(255, 182, 193, 0.5)",   // Light Pink
        "rgba(152, 251, 152, 0.5)",   // Pale Green
        "rgba(255, 99, 71, 0.5)",     // Tomato
        "rgba(255, 165, 0, 0.5)",     // Orange
        "rgba(0, 255, 127, 0.5)",     // Spring Green
        "rgba(255, 105, 180, 0.5)",   // Hot Pink
        "rgba(0, 255, 255, 0.5)",     // Cyan / Aqua
        "rgba(255, 218, 185, 0.5)",   // Peach Puff
        "rgba(123, 104, 238, 0.5)",   // Medium Slate Blue
        "rgba(240, 230, 140, 0.5)",   // Khaki
        "rgba(216, 191, 216, 0.5)",   // Thistle
        "rgba(255, 192, 203, 0.5)",   // Pink
        "rgba(221, 160, 221, 0.5)",   // Plum
        "rgba(176, 224, 230, 0.5)",   // Powder Blue
        "rgba(255, 127, 80, 0.5)",    // Coral
        "rgba(70, 130, 180, 0.5)",    // Steel Blue
        "rgba(218, 165, 32, 0.5)",    // Goldenrod
        "rgba(128, 128, 128, 0.5)",   // Gray
        "rgba(0, 128, 128, 0.5)",     // Teal
        "rgba(139, 69, 19, 0.5)",     // Saddle Brown
        "rgba(46, 139, 87, 0.5)",     // Sea Green
        "rgba(128, 0, 0, 0.5)",       // Maroon
        "rgba(138, 43, 226, 0.5)",    // Blue Violet
        "rgba(75, 0, 130, 0.5)",      // Indigo
        "rgba(85, 107, 47, 0.5)",     // Dark Olive Green
        "rgba(153, 50, 204, 0.5)",    // Dark Orchid
        "rgba(139, 0, 0, 0.5)",       // Dark Red
        "rgba(72, 61, 139, 0.5)",     // Dark Slate Blue
        "rgba(47, 79, 79, 0.5)",      // Dark Slate Gray
        "rgba(139, 0, 139, 0.5)"      // Dark Magenta
      ];
      // Stryker restore all
      
    const defaultMessage = props.title?.includes("Join") ? "join" : "visit";

    return (
        <Card
            data-testid="commonsList-background"
            style={
                // Stryker disable all: don't test CSS params
                { background: 'rgba(255, 255, 255, 0.7)', 
                    borderRadius: '10px', 
                    padding: '10px', 
                    boxShadow: '5px 5px 10px 5px lightgrey',
                    backdropFilter: 'blur(10px)', 
                    WebkitBackdropFilter: 'blur(10px)'}
                // Stryker restore all
            }
            className="my-3 border-0"
        >
            <Card.Title
                data-testid="commonsList-title"
                style={
                    // Stryker disable all: don't test CSS params
                    { fontSize: "35px",
                    fontWeight: "bold",
                    color: "#1E4D2B"
                    }
                    // Stryker restore all
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
                            <Col data-testid="commonsList-subtitle-name" sx={4}
                            style = {{padding: "12px 12px 0px 12px"}}>Common's Name</Col>
                            <Col sm={4}></Col>
                        </Row>
                    </Container>
                </Card.Subtitle>
                {
                    props.commonList.map(
                        (c) => (<CommonsCard key={c.id} commons={c} buttonText={props.buttonText} buttonLink={props.buttonLink} color={cardColors[c.id % cardColors.length]} />)
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