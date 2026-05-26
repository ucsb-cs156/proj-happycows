import React from "react";
import { Row, Card, Col, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/currentUser";
import { daysSinceTimestamp } from "main/utils/dateUtils";
import { useBackend } from "main/utils/useBackend";

export default function CommonsOverview({ commonsPlus, currentUser }) {
  let navigate = useNavigate();

  // Stryker disable all
  const leaderboardButtonClick = () => {
    navigate("/leaderboard/" + commonsPlus.commons.id);
  };
  // Stryker restore all

  const showLeaderboard =
    hasRole(currentUser, "ROLE_ADMIN") || commonsPlus.commons.showLeaderboard;

  // Stryker disable all
  const { data: announcementsData } = useBackend(
    [`/api/announcements/current?commonsId=${commonsPlus.commons.id}`],
    {
      method: "GET",
      url: "/api/announcements/current",
      params: {
        commonsId: commonsPlus.commons.id,
      },
    },
    [],
  );
  // Stryker restore all

  // Stryker disable next-line all : fallback handling
  const announcements = announcementsData?.content || [];

  return (
    <Card data-testid="CommonsOverview">
      <Card.Header as="h5" className="woodenboardtable">
        Announcements
      </Card.Header>

      <Card.Body
        style={
          // Stryker disable next-line all: don't test CSS params
          { backgroundColor: "rgb(245, 210, 140)" }
        }
      >
        <Row>
          <Col>
            <Card.Title>
              Today is day
              {daysSinceTimestamp(commonsPlus.commons.startingDate)}!
            </Card.Title>

            <Card.Text>Total Players: {commonsPlus.totalUsers}</Card.Text>

            {announcements.length > 0 && (
              <div className="mt-3" data-testid="announcements-container">
                {announcements.map((announcement) => (
                  <Alert
                    key={announcement.id}
                    variant="warning"
                    data-testid={`CommonsOverview-announcement-${announcement.id}`}
                  >
                    {announcement.announcementText}
                  </Alert>
                ))}
              </div>
            )}
          </Col>

          <Col>
            {showLeaderboard && (
              <Button
                variant="outline-success"
                data-testid="user-leaderboard-button"
                onClick={leaderboardButtonClick}
              >
                Leaderboard
              </Button>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
