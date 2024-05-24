import React from "react";
import { Row, Card, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";
import { daysSinceTimestamp } from "main/utils/dateUtils";
import AnnouncementCard from "main/components/Announcement/AnnouncementCard";

export default function CommonsOverview({ commonsPlus, currentUser, announcement }) {

    let navigate = useNavigate();
    // Stryker disable next-line all
    const leaderboardButtonClick = () => { navigate("/leaderboard/" + commonsPlus.commons.id) };
    const showLeaderboard = (hasRole(currentUser, "ROLE_ADMIN") || commonsPlus.commons.showLeaderboard );
    return (
        <Card data-testid="CommonsOverview">
            <Card.Header as="h5">Announcements</Card.Header>
            <Card.Body>
                <Row>
                    <Col className="text-start">
                        <div data-testid="announcement-test">
                            {announcement ? (
                                <AnnouncementCard announcement={announcement} />
                            ) : (
                                <p>No announcements available.</p>
                            )}
                        </div>
                    </Col>
                </Row>
                <Row className="mt-3">
                    <Col>
                        <Card.Title>Today is day {daysSinceTimestamp(commonsPlus.commons.startingDate)}!</Card.Title>
                        <Card.Text>Total Players: {commonsPlus.totalUsers}</Card.Text>
                    </Col>
                    <Col>
                        {showLeaderboard &&
                        (<Button variant="outline-success" data-testid="user-leaderboard-button" onClick={leaderboardButtonClick}>
                            Leaderboard
                        </Button>)}
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}; 