import React, { } from "react";
import { Card, Container, Row, Col } from "react-bootstrap";

export function isFutureDate(startingDate) {
    const curr = new Date();
    const startYear = parseInt(startingDate);
    const startMonth = parseInt(startingDate.substring(5,7));
    const startDate = parseInt(startingDate.substring(8,10));
    const currYear = curr.getFullYear();
    const currMonth = curr.getMonth() + 1;
    const currDate = curr.getDate();

    if (startYear === currYear) {
        if (startMonth === currMonth) {
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

    if (!announcement || !announcement.startDate || isFutureDate(announcement.startDate)) {
        return null;
    }

    if (announcement.endDate && (!isFutureDate(announcement.endDate))) {
        return null;
    }

    return (
        <Card.Body 
        // Stryker disable next-line all : don't mutation test CSS
        style={{ fontSize: "14px", border: "1px solid lightgrey", padding: "4px", borderRadius: "10px", margin: "10px 0" }}>
            <Container>
                <Row>
                    <Col xs={12} data-testid={`${testIdPrefix}-id-${announcement.announcementText}`}>
                        <div
                                // Stryker disable next-line all : don't mutation test CSS
                                style={{overflow: 'auto',
                                // Stryker disable next-line all : don't mutation test CSS
                                maxHeight: '100px',
                                // Stryker disable next-line all : don't mutation test CSS
                                wordWrap: 'break-word',
                                // Stryker disable next-line all : don't mutation test CSS
                                padding: '5px'
                            }}
                        >
                            {announcement.announcementText}
                        </div>
                    </Col>
                </Row>
            </Container>
        </Card.Body>
    );
};

export default AnnouncementCard;