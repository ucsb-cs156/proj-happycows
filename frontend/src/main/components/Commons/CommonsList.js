import React from "react";
import CommonsCard from "./CommonsCard";
import { Card, Container, Row, Col } from "react-bootstrap";

const CommonsList = (props) => {
    const defaultMessage = props.title?.includes("Join") ? "join" : "visit";
    // Stryker disable next-line all: don't test CSS params
    function getRandomColor(id) {
        // Stryker disable all
        const colors = [
            "#FF4500", 
            "#DE3163", 
            "#6495ED", 
            "#FFF8DC", 
            "#DC143C", 
            "#00FFFF",  
            "#BDB76B", 
            "#8B008B", 
            "#556B2F", 
            "#FF8C00", 
            "#9932CC", 
            "#8B0000", 
            "#E9967A", 
            "#8FBC8F", 
            "#483D8B", 
            "#2F4F4F", 
            "#00CED1", 
            "#9400D3", 
            "#FF1493", 
            "#00BFFF", 
            "#696969", 
            "#1E90FF", 
            "#B22222", 
            "#FFD700", 
            "#DAA520"
        ];
        // Stryker restore all
        // Stryker disable next-line all: don't test CSS params
        return colors[id % colors.length];
    }
    

    return (
        <Card
            style={
                // Stryker disable next-line all: don't test CSS params
                { opacity: ".9",boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)"}
            }
            className="my-3 border-0"
        >
            <Card.Title
                data-testid="commonsList-title"
                style={
                    // Stryker disable next-line all: don't test CSS params
                    { fontSize: "35px" }
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
                            <Col data-testid="commonsList-subtitle-name" sx={4} style={
                    // Stryker disable next-line all: don't test CSS params
                    { fontSize: "20px", fontWeight: "bold",fontFamily:'fantasy'}
                } >Common's Name</Col>
                            <Col sm={4}></Col>
                        </Row>
                    </Container>
                </Card.Subtitle>
                {
                    props.commonList.map(
                        
                        (c) => (<CommonsCard key={c.id} commons={c} buttonText={props.buttonText} buttonLink={props.buttonLink} color={getRandomColor(c.id)}/>)
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