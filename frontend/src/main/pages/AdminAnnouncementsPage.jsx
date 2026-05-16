import React from "react";
import Button from "react-bootstrap/Button";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { Row, Col } from "react-bootstrap";
import { useParams } from "react-router";
import { useBackend } from "main/utils/useBackend";
import { useCurrentUser } from "main/utils/currentUser";
import AnnouncementTable from "main/components/Announcement/AnnouncementTable";
import { announcementFixtures } from "fixtures/announcementFixtures";

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
    {
      content: announcementFixtures.threeAnnouncements,
      pageable: {
        pageNumber: 0,
        pageSize: 1000,
      },
      totalElements: 3,
      totalPages: 1,
    },
  );

  const { data: currentUser } = useCurrentUser();
  const announcements =
    announcementsResponse?.content?.length > 0
      ? announcementsResponse.content
      : announcementFixtures.threeAnnouncements;

  const commonsName = commonsPlus?.commons.name;

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
            <h2>Announcements for Commons: {commonsName}</h2>
          </Col>
          <Col style={buttonStyle}>
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
          commonsId={commonsId}
        />
      </div>
    </BasicLayout>
  );
}
