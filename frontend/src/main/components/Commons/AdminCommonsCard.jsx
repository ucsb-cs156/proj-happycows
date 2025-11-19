import React, { useState } from "react";
import { Card, Button, Modal, Row, Col } from "react-bootstrap";
import { useBackendMutation } from "main/utils/useBackend";
import { onDeleteSuccess } from "main/utils/commonsUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/currentUser";

export default function AdminCommonsCard({ commonItem, currentUser }) {
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const commons = commonItem.commons;

  const deleteMutation = useBackendMutation(
    (commonItem) => ({
      url: "/api/commons",
      method: "DELETE",
      params: { id: commonItem.commons.id },
    }),
    { onSuccess: onDeleteSuccess },
    ["/api/commons/allplus"],
  );

  const handleEdit = () => {
    navigate(`/admin/editcommons/${commons.id}`);
  };

  const handleDelete = () => {
    setShowModal(true);
  };

  const confirmDelete = async () => {
    deleteMutation.mutate(commonItem);
    setShowModal(false);
  };

  const handleLeaderboard = () => {
    navigate(`/leaderboard/${commons.id}`);
  };

  const formatDate = (dateString) => {
    return String(dateString).slice(0, 10);
  };

  const deleteModal = (
    <Modal
      data-testid={`AdminCommonsCard-Modal-${commons.id}`}
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
          data-testid={`AdminCommonsCard-Modal-Cancel-${commons.id}`}
          onClick={() => setShowModal(false)}
        >
          Keep this Commons
        </Button>
        <Button
          variant="danger"
          data-testid={`AdminCommonsCard-Modal-Delete-${commons.id}`}
          onClick={confirmDelete}
        >
          Permanently Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );

  if (!hasRole(currentUser, "ROLE_ADMIN")) {
    return null;
  }

  // Stryker disable all - styles that don't need to be mut tested
  const cardStyle = {
    border: "1px solid #e0e0e0",
    boxShadow: isHovered
      ? "0 4px 8px rgba(0,0,0,0.17)"
      : "0 2px 4px rgba(0,0,0,0.1)",
    transition: "box-shadow 0.2s ease",
  };

  const headerStyle = {
    backgroundColor: "#f8f9fa",
    borderBottom: "3px solid rgb(142, 221, 39)",
    color: "#212529",
  };

  const bodyStyle = {
    backgroundColor: "#ffffff",
  };
  // Stryker restore all

  return (
    <>
      <Card
        className="mb-3"
        data-testid={`AdminCommonsCard-${commons.id}`}
        style={cardStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card.Header style={headerStyle}>
          <Card.Title className="mb-0">
            {commons.name} (ID: {commons.id})
          </Card.Title>
        </Card.Header>
        <Card.Body style={bodyStyle}>
          <Row>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Cow Price:</strong>
              </div>
              <div>{commons.cowPrice}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Milk Price:</strong>
              </div>
              <div>{commons.milkPrice}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Start Balance:</strong>
              </div>
              <div>{commons.startingBalance}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Starting Date:</strong>
              </div>
              <div>{formatDate(commons.startingDate)}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Last Date:</strong>
              </div>
              <div>{formatDate(commons.lastDate)}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Degrad Rate:</strong>
              </div>
              <div>{commons.degradationRate}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Show Leaderboard:</strong>
              </div>
              <div>{String(commons.showLeaderboard)}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Show Chat:</strong>
              </div>
              <div>{String(commons.showChat)}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Total Cows:</strong>
              </div>
              <div>{commonItem.totalCows || 0}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Cap / User:</strong>
              </div>
              <div>{commons.capacityPerUser}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Carry Cap:</strong>
              </div>
              <div>{commons.carryingCapacity}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Eff Cap:</strong>
              </div>
              <div>{commonItem.effectiveCapacity || 0}</div>
            </Col>
          </Row>
          <hr />
          <div className="d-flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleEdit}
              data-testid={`AdminCommonsCard-Edit-${commons.id}`}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              data-testid={`AdminCommonsCard-Delete-${commons.id}`}
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLeaderboard}
              data-testid={`AdminCommonsCard-Leaderboard-${commons.id}`}
            >
              Leaderboard
            </Button>
            <Button
              variant="success"
              size="sm"
              href={`/api/commonstats/download?commonsId=${commons.id}`}
              data-testid={`AdminCommonsCard-StatsCSV-${commons.id}`}
            >
              Stats CSV
            </Button>
            <Button
              variant="info"
              size="sm"
              href={`/admin/announcements/${commons.id}`}
              data-testid={`AdminCommonsCard-Announcements-${commons.id}`}
            >
              Announcements
            </Button>
          </div>
        </Card.Body>
      </Card>
      {deleteModal}
    </>
  );
}
