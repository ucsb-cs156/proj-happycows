import React from "react";
import { Row, Card, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";

export default function CommonsOverview({ commons, currentUser }) {

    let navigate = useNavigate();
    // Stryker disable next-line all
    const leaderboardButtonClick = () => { navigate("/leaderboard/" + commons.id) };
    const showLeaderboard = (hasRole(currentUser, "ROLE_ADMIN") || commons.showLeaderboard );

    const date1 = new Date(commons.startingDate);
    const date2 = new Date();
    const Difference_In_Time = Math.abs(date2.getTime() - date1.getTime());
    const days = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));
    return (
        <Card data-testid="CommonsOverview">
            <Card.Header as="h5">Announcements</Card.Header>
            <Card.Body>
                <Row>
                    <Col>

                        <Card.Title>Today is day {days}!</Card.Title>

                        <Card.Text>Total Players: {commons.totalPlayers}</Card.Text>
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