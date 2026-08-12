import React from "react";
import { Row, Card, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/currentUser";
import { daysSinceTimestamp } from "main/utils/dateUtils";
import CurrentAnnouncements from "main/components/Announcement/CurrentAnnouncements";

export default function GameOverview({
  gamePlus,
  currentUser,
  currentAnnouncements,
  emulatingStudentView = false,
}) {
  let navigate = useNavigate();

  // Stryker disable all
  const dashboardButtonClick = () => {
    navigate("/dashboard/" + gamePlus.game.id);
  };
  // Stryker restore all

  // Admins always see the Dashboard button on their own play page,
  // regardless of the game's showLeaderboard setting - but when an admin is
  // emulating a student's read-only view, the button should only show up if
  // a real student would actually see it.
  const showDashboard =
    (!emulatingStudentView && hasRole(currentUser, "ROLE_ADMIN")) ||
    gamePlus.game.showLeaderboard;

  return (
    <Card data-testid="GameOverview">
      <Card.Header as="h5" className="woodenboardtable">
        Announcements
      </Card.Header>
      <Card.Body
        style={
          // Stryker disable next-line all: don't test CSS params
          { backgroundColor: "rgb(245, 210, 140)" }
        }
      >
        <CurrentAnnouncements announcements={currentAnnouncements} />

        <Row>
          <Col>
            <Card.Title>
              Today is day {daysSinceTimestamp(gamePlus.game.startingDate)}!
            </Card.Title>
            <Card.Text>Total Players: {gamePlus.totalUsers}</Card.Text>
          </Col>
          <Col>
            {showDashboard && (
              <Button
                variant="outline-success"
                data-testid="user-leaderboard-button"
                onClick={dashboardButtonClick}
              >
                Dashboard
              </Button>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
