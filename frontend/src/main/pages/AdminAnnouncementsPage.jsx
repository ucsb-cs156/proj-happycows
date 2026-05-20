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
  const { data: currentUser } = useCurrentUser();

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

  const { data: announcementsPage } = useBackend(
    ["/api/announcements/getbycommonsid", commonsId],
    {
      method: "GET",
      url: "/api/announcements/getbycommonsid",
      params: {
        commonsId,
      },
    },
    { content: [] },
  );
  // Stryker restore all

  const commonsName = commonsPlus?.commons.name;
  const announcements = announcementsPage.content ?? [];

  return (
    <BasicLayout>
      <div className="pt-2">
        <Row className="pt-5">
          <Col>
            <h2>Announcements for Commons: {commonsName}</h2>
            <Button
              variant="primary"
              href={`/admin/announcements/${commonsId}/create`}
            >
              Create Announcement
            </Button>
          </Col>
        </Row>
        <Row className="pt-3">
          <Col>
            <AnnouncementTable
              announcements={announcements}
              currentUser={currentUser}
              commonsId={commonsId}
            />
          </Col>
        </Row>
      </div>
    </BasicLayout>
  );
}
