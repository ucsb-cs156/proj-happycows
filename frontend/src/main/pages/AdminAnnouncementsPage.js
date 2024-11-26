import React from "react";
import Button from 'react-bootstrap/Button';
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useBackend } from "main/utils/useBackend";

export default function AdminAnnouncementsPage() {
    const { commonsId } = useParams();

    // Stryker disable all (Copied from frontend/src/main/pages/AdminViewPlayPage.js)
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

    const commonsName = commonsPlus?.commons.name;

    return (
        <BasicLayout>
        <div className="pt-2">
          <Row  className="pt-5">
            <Col>
              <h2>Announcements for Commons: {commonsName}</h2>
              <Button variant = "primary" href = {`/admin/announcements/${commonsId}/create`} >
                Create Announcement
              </Button>
            </Col>
          </Row>
        </div>
      </BasicLayout>
    );

};