import React, { useState } from "react";
import { Card, Button, Modal, Row, Col } from "react-bootstrap";
import { useBackendMutation } from "main/utils/useBackend";
import { onDeleteSuccess } from "main/utils/gameUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/currentUser";

export default function AdminGameCard({ commonItem, currentUser }) {
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const game = commonItem.game;

  const deleteMutation = useBackendMutation(
    (commonItem) => ({
      url: "/api/game",
      method: "DELETE",
      params: { id: commonItem.game.id },
    }),
    { onSuccess: onDeleteSuccess },
    ["/api/game/allplus"],
  );

  const handleEdit = () => {
    navigate(`/admin/editgame/${game.id}`);
  };

  const handleDelete = () => {
    setShowModal(true);
  };

  const confirmDelete = async () => {
    deleteMutation.mutate(commonItem);
    setShowModal(false);
  };

  const formatDate = (dateString) => {
    return String(dateString).slice(0, 10);
  };

  const deleteModal = (
    <Modal
      data-testid={`AdminGameCard-Modal-${game.id}`}
      show={showModal}
      onHide={() => setShowModal(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this game?</Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          data-testid={`AdminGameCard-Modal-Cancel-${game.id}`}
          onClick={() => setShowModal(false)}
        >
          Keep this Game
        </Button>
        <Button
          variant="danger"
          data-testid={`AdminGameCard-Modal-Delete-${game.id}`}
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
        data-testid={`AdminGameCard-${game.id}`}
        style={cardStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card.Header style={headerStyle}>
          <Card.Title className="mb-0">
            <Row>
              <Col>
                {game.name} (ID: {game.id})
              </Col>
              <Col>
                <div>
                  <strong>Hidden:&nbsp;</strong>
                  {String(game.hidden)}
                </div>
              </Col>
            </Row>
          </Card.Title>
        </Card.Header>
        <Card.Body style={bodyStyle}>
          <Row>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Cow Price:</strong>
              </div>
              <div>{game.cowPrice}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Milk Price:</strong>
              </div>
              <div>{game.milkPrice}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Start Balance:</strong>
              </div>
              <div>{game.startingBalance}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Starting Date:</strong>
              </div>
              <div>{formatDate(game.startingDate)}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Last Date:</strong>
              </div>
              <div>{formatDate(game.lastDate)}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Degrad Rate:</strong>
              </div>
              <div>{game.degradationRate}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Show Dashboard:</strong>
              </div>
              <div>{String(game.showLeaderboard)}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Show Chat:</strong>
              </div>
              <div>{String(game.showChat)}</div>
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
              <div>{game.capacityPerUser}</div>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <div>
                <strong>Carry Cap:</strong>
              </div>
              <div>{game.carryingCapacity}</div>
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
              data-testid={`AdminGameCard-Edit-${game.id}`}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              data-testid={`AdminGameCard-Delete-${game.id}`}
            >
              Delete
            </Button>
            <Button
              variant="success"
              size="sm"
              href={`/api/commonstats/download?gameId=${game.id}`}
              data-testid={`AdminGameCard-StatsCSV-${game.id}`}
            >
              Stats CSV
            </Button>
            <Button
              variant="info"
              size="sm"
              href={`/admin/announcements/${game.id}`}
              data-testid={`AdminGameCard-Announcements-${game.id}`}
            >
              Announcements
            </Button>
            <Button
              variant="info"
              size="sm"
              href={`/admin/chat/${game.id}`}
              data-testid={`AdminGameCard-Chat-${game.id}`}
            >
              Chat
            </Button>
            <Button
              variant="info"
              size="sm"
              href={`/admin/dashboard/${game.id}`}
              data-testid={`AdminGameCard-Dashboard-${game.id}`}
            >
              Dashboard
            </Button>
            {game.courseId != null && (
              <Button
                variant="info"
                size="sm"
                href={`/admin/gameactivity/${game.id}`}
                data-testid={`AdminGameCard-Activity-${game.id}`}
              >
                Activity
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
      {deleteModal}
    </>
  );
}
