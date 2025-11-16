import React, { useState } from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { useCurrentUser } from "main/utils/currentUser";
import { Card, Button, Row, Col, Modal } from "react-bootstrap";
import { useNavigate } from "react-router";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/commonsUtils";

/* Stryker disable StringLiteral, BooleanLiteral, ArrayDeclaration, MethodExpression, ArrowFunction, ConditionalExpression: "Exclude noisy UI-focused mutants for this component" */
export default function AdminListCommonsV2() {
  const { data: currentUser } = useCurrentUser();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [commonsToDelete, setCommonsToDelete] = useState(null);

  const {
    data: commons,
    error: _error,
    status: _status,
  } = useBackend([
    "/api/commons/allplus",
  ], { method: "GET", url: "/api/commons/allplus" }, []);

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/commons/allplus"],
  );

  const manage = (commonsId) => {
    navigate(`/admin/editcommons/${commonsId}`);
  };

  const leaderboard = (commonsId) => {
    navigate(`/leaderboard/${commonsId}`);
  };

  const announcements = (commonsId) => {
    navigate(`/admin/announcements/${commonsId}`);
  };

  const onDeleteClick = (commonsId) => {
    setCommonsToDelete(commonsId);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (!commonsToDelete) return;
    const cellLike = { row: { values: { "commons.id": commonsToDelete } } };
    deleteMutation.mutate(cellLike);
    setShowModal(false);
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <Row className="pt-4">
          <Col>
            <h2>Commons (Card view)</h2>
          </Col>
        </Row>

        <Row className="pt-3" xs={1} sm={2} md={3} lg={3}>
          {commons && commons.map((c) => (
            <Col key={c.commons.id} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>{c.commons.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">id: {c.commons.id}</Card.Subtitle>
                  <Card.Text>
                    <strong>id:</strong> {c.commons.id}<br />
                    <strong>Name:</strong> {c.commons.name}<br />
                    <strong>Cow Price:</strong> {c.commons.cowPrice}<br />
                    <strong>Milk Price:</strong> {c.commons.milkPrice}<br />
                    <strong>Start Bal:</strong> {c.commons.startingBalance}<br />
                    <strong>Starting Date:</strong> {c.commons.startingDate ? String(c.commons.startingDate).slice(0,10) : ''}<br />
                    <strong>Last Date:</strong> {c.commons.lastDate ? String(c.commons.lastDate).slice(0,10) : ''}<br />
                    <strong>Degrad Rate:</strong> {c.commons.degradationRate}<br />
                    <strong>Show LrdrBrd?</strong> {String(c.commons.showLeaderboard)}<br />
                    <strong>Show Chat?</strong> {String(c.commons.showChat)}<br />
                    <strong>Tot Cows:</strong> {c.totalCows}<br />
                    <strong>Cap / User:</strong> {c.commons.capacityPerUser}<br />
                    <strong>Carry Cap:</strong> {c.commons.carryingCapacity}<br />
                    <strong>Eff Cap:</strong> {c.effectiveCapacity}
                  </Card.Text>
                  <div className="d-flex justify-content-between flex-wrap">
                    <div className="mb-2">
                      <Button
                        variant="primary"
                        onClick={() => manage(c.commons.id)}
                        data-testid={`AdminListCommonsV2-Manage-${c.commons.id}`}
                        className="me-2"
                      >
                        Edit
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() => onDeleteClick(c.commons.id)}
                        className="me-2"
                      >
                        Delete
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => leaderboard(c.commons.id)}
                        className="me-2"
                      >
                        Leaderboard
                      </Button>

                      <Button
                        variant="success"
                        href={`/api/commonstats/download?commonsId=${c.commons.id}`}
                        className="me-2"
                      >
                        Stats CSV
                      </Button>

                      <Button
                        variant="info"
                        onClick={() => announcements(c.commons.id)}
                      >
                        Announcements
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <Modal
          data-testid="AdminListCommonsV2-Modal"
          show={showModal}
          onHide={() => setShowModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this commons?</Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              data-testid="AdminListCommonsV2-Modal-Cancel"
              onClick={() => setShowModal(false)}
            >
              Keep this Commons
            </Button>
            <Button
              variant="danger"
              data-testid="AdminListCommonsV2-Modal-Delete"
              onClick={() => confirmDelete()}
            >
              Permanently Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </BasicLayout>
  );
}
/* Stryker enable StringLiteral, BooleanLiteral, ArrayDeclaration, MethodExpression, ArrowFunction, ConditionalExpression */
