import React from "react";
import Button from "react-bootstrap/Button";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { Row, Col } from "react-bootstrap";
import { useParams } from "react-router";
import { useBackend } from "main/utils/useBackend";
import { useCurrentUser } from "main/utils/currentUser";
import AnnouncementTable from "main/components/Announcement/AnnouncementTable";

export default function AdminAnnouncementsPage() {
  const { commonsId } = useParams();

  // Stryker disable all
  const { data: commonsPlus } = useBackend(
    [`/api/commons/plus?id=${commonsId}`],
    {
      method: "GET",
      url: "/api/commons/plus",
      params: {
        id: commonsId,
      },
    },
  );

  const { data: announcementsResponse } = useBackend(
    [`/api/announcements/getbycommonsid?commonsId=${commonsId}`],
    {
      method: "GET",
      url: "/api/announcements/getbycommonsid",
      params: {
        commonsId: commonsId,
      },
    },
    { content: [] },
  );

  const announcements = announcementsResponse?.content || [];
  const { data: currentUser } = useCurrentUser();

  const createButtonStyle = {
    display: "flex",
    justifyContent: "flex-end",
  };
  // Stryker restore all

  const commonsName = commonsPlus?.commons.name;

  return (
    <BasicLayout>
      <div className="pt-2">
        <Row className="pt-5 pb-3">
          <Col>
            <h2>Announcements for Commons: {commonsName}</h2>
          </Col>
          <Col md="auto" style={createButtonStyle}>
            <Button
              variant="primary"
              href={`/admin/announcements/${commonsId}/create`}
            >
              Create Announcement
            </Button>
          </Col>
        </Row>
        <AnnouncementTable
          announcements={announcements}
          currentUser={currentUser}
        />
      </div>
    </BasicLayout>
  );
}
