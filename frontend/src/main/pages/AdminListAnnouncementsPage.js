import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import CommonsTable from 'main/components/Commons/CommonsTable';
import { useBackend } from 'main/utils/useBackend';
import { useCurrentUser } from "main/utils/currentUser";
import { Button, Row, Col } from "react-bootstrap";
import { useParams, Navigate } from "react-router-dom";

export default function AdminListAnnouncementsPage()
{
    const { commonsId } = useParams();
    const { data: currentUser} = useCurrentUser();

    const isUserAdmin = currentUser?.root?.user?.admin;

    // Stryker disable all
    const { data: announcements, error: _error, status: _status } = useBackend(
        [`/api/announcements/all?commonsId=${commonsId}`],
        { method: "GET", url: `/api/announcements/all`, params: { commonsId } },
        []
    );
    // Stryker restore all

    //redirect if user is not admin
    if (!isUserAdmin) {
        return <Navigate to="/not-found" />;
    }

    return (
        <BasicLayout>
            <div className="pt-2">
                <Row className="pt-5">
                    <Col>
                        <h2>Announcements for Commons {commonsId}</h2>
                    </Col>
                    <Col style={{ textAlign: 'right' }}>
                        <Button href={`/admin/announcements/${commonsId}/create`}>
                            Create Announcement
                        </Button>
                    </Col>
                </Row>
                <CommonsTable commons={announcements} currentUser={currentUser} />
            </div>
        </BasicLayout>
  );
};
