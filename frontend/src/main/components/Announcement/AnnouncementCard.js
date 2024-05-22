import React, { useState } from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";

const curr = new Date();

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

    const [isCollapsed, setIsCollapsed] = useState(true);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <Card.Body style={
            // Stryker disable next-line all : don't mutation test CSS 
            { fontSize: "14px", border: "1px solid lightgrey", padding: "4px" }
        }>
            <Container>
                <Row>
                    <Col xs={12} data-testid={`${testIdPrefix}-id-${announcement.announcementText}`}>
                        <div style={{
                            // Stryker disable next-line all : don't mutation test CSS
                            whiteSpace: isCollapsed ? 'nowrap' : 'normal',
                            overflow: isCollapsed ? 'hidden' : 'visible',
                            textOverflow: isCollapsed ? 'ellipsis' : 'clip',
                            maxWidth: isCollapsed ? '250px' : 'none'
                        }}>
                            {announcement.announcementText}
                        </div>
                        <Button variant="link" onClick={toggleCollapse} style={
                            // Stryker disable next-line all : don't mutation test CSS
                            { fontSize: '11px', padding: '2px' }}>
                            {isCollapsed ? 'Show more' : 'Show less'}
                        </Button>
                    </Col>
                </Row>
            </Container>
        </Card.Body>
    );
};

export default AnnouncementCard;