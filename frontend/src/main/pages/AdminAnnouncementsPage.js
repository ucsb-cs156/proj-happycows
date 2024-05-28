import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import AnnouncementTable from "main/components/Announcement/AnnouncementTable";
import { useCurrentUser } from "main/utils/currentUser";
import { useBackend } from "main/utils/useBackend";

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
        }
    );
    // Stryker restore all

    // Stryker disable  all 
    const { data: announcements, error: _error, status: _status } =
    useBackend(
        [`/api/announcements/getbycommonsid?commonsId=${commonsId}`],
        { 
            method: "GET",
            url: `/api/announcements/`,
            params: {
                commonsId: commonsId
            }
        },
        []
    );
    // Stryker restore  all 

    const commonsName = commonsPlus?.commons.name;

    return (
        <BasicLayout>
        <div className="pt-2">
          <Row  className="pt-5">
            <Col>
              <h2>Announcements for Commons: {commonsName}</h2>
            </Col>
          </Row>
          <AnnouncementTable announcements={announcements} currentUser={currentUser} />
        </div>
      </BasicLayout>
    );

};