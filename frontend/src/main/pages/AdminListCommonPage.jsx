import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AdminCommonsCard from "main/components/Commons/AdminCommonsCard";
import { useBackend } from "main/utils/useBackend";
import { useCurrentUser } from "main/utils/currentUser";
import { Button, Row, Col, Container } from "react-bootstrap";

export default function AdminListCommonsPage() {
  const { data: currentUser } = useCurrentUser();

  // Stryker disable  all
  const {
    data: commons,
    error: _error,
    status: _status,
  } = useBackend(
    ["/api/commons/allplus"],
    { method: "GET", url: "/api/commons/allplus" },
    [],
  );
  // Stryker restore  all

  // Stryker disable all - styles that don't need to be mut tested
  const DownloadButtonStyle = {
    display: "flex",
    justifyContent: "flex-end",
  };
  // Stryker restore all

  return (
    <BasicLayout>
      <div className="pt-2">
        <Row className="pt-5">
          <Col>
            <h2>Commons</h2>
          </Col>
          <Col style={DownloadButtonStyle}>
            <Button href="/api/commonstats/downloadAll">
              Download All Stats
            </Button>
          </Col>
        </Row>
        <Container fluid className="pt-3">
          {commons &&
            commons.map((common) => (
              <AdminCommonsCard
                key={common.commons.id}
                commonItem={common}
                currentUser={currentUser}
              />
            ))}
        </Container>
      </div>
    </BasicLayout>
  );
}
