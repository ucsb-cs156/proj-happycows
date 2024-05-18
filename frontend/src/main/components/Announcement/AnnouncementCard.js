import React from "react";
import { Card, Container, Row, Col } from "react-bootstrap";

const curr = new Date();

function isFutureDate(startingDate) {
    const startYear = parseInt(startingDate);
    const startMonth = parseInt(startingDate.substring(5,7));
    const startDate = parseInt(startingDate.substring(8,10));
    const currYear = curr.getFullYear();
    const currMonth = curr.getMonth() + 1;
    const currDate = curr.getDate();

    if (startYear === currYear) {
        if (startMonth === currMonth) {
            // Stryker disable next-line all: mutation test unreasonable
            return startDate > currDate;
        } else {
            // Stryker disable next-line all: mutation test unreasonable
            return startMonth > currMonth;
        }
    } else {
        // Stryker disable next-line all: mutation test unreasonable
        return startYear > currYear;
    }
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