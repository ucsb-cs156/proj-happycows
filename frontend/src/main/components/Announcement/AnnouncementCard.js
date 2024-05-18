import React from "react";
import { Card, Container, Row, Col } from "react-bootstrap";

export function isFutureDate(startingDate) {
    const curr = new Date();
    const startDate = new Date(startingDate);
    // Stryker disable next-line all: mutation test unreasonable
    return startDate > curr;
}

const AnnouncementCard = ({ announcement }) => {
    const testIdPrefix = "announcementCard";
    if (!announcement || isFutureDate(announcement.startDate)) {
        return null;
    }

    if ( announcement.endDate && (!isFutureDate(announcement.endDate))) {
        return null;
    }

    return (
        <Card.Body style={
            // Stryker disable next-line all : don't mutation test CSS 
            { fontSize: "14px", border: "1px solid lightgrey", padding: "4px" }
        }>
            <Container>
                <Row>
                    <Col sx={4} data-testid={`${testIdPrefix}-id-${announcement.announcementText}`}>{announcement.announcementText}</Col>
                </Row>
            </Container>
        </Card.Body>
    );
};

export default AnnouncementCard;