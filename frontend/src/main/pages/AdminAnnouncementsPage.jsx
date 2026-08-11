import React from "react";
import Button from "react-bootstrap/Button";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { Row, Col } from "react-bootstrap";
import { useParams } from "react-router";
import { useBackend } from "main/utils/useBackend";
import { useCurrentUser } from "main/utils/currentUser";
import AnnouncementTable from "main/components/Announcement/AnnouncementTable";

export default function AdminAnnouncementsPage() {
  const { gameId } = useParams();

  // Stryker disable all
  const { data: gamePlus } = useBackend([`/api/game/plus?id=${gameId}`], {
    method: "GET",
    url: "/api/game/plus",
    params: {
      id: gameId,
    },
  });

  const { data: announcementsResponse } = useBackend(
    [`/api/announcements/getbygameid?gameId=${gameId}`],
    {
      method: "GET",
      url: "/api/announcements/getbygameid",
      params: {
        gameId: gameId,
      },
    },
  );

  const { data: currentUser } = useCurrentUser();
  const announcements = announcementsResponse?.content ?? [];

  const gameName = gamePlus?.game.name;

  // Stryker disable all - styles that don't need to be mut tested
  const buttonStyle = {
    display: "flex",
    justifyContent: "flex-end",
  };
  // Stryker restore all

  return (
    <BasicLayout>
      <div className="pt-2">
        <Row className="pt-5 pb-3" style={{ gap: "30px" }}>
          <Col md="auto">
            <h2>Announcements for Game: {gameName}</h2>
          </Col>
          <Col style={buttonStyle}>
            <Button
              variant="primary"
              href={`/admin/announcements/${gameId}/create`}
            >
              Create Announcement
            </Button>
          </Col>
        </Row>
        <AnnouncementTable
          announcements={announcements}
          currentUser={currentUser}
          gameId={gameId}
        />
      </div>
    </BasicLayout>
  );
}
