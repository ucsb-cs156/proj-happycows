import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "main/utils/useBackend";
import { useCurrentUser } from "main/utils/currentUser";
import { Card, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

/* Stryker disable StringLiteral, BooleanLiteral, ArrayDeclaration, MethodExpression, ArrowFunction, ConditionalExpression: "Exclude noisy UI-focused mutants for this component" */
export default function AdminListCommonsV2() {
  const { data: _currentUser } = useCurrentUser();
  const navigate = useNavigate();

  const {
    data: commons,
    error: _error,
    status: _status,
  } = useBackend(
    ["/api/commons/allplus"],
    { method: "GET", url: "/api/commons/allplus" },
    [],
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
    if (window.confirm("Are you sure you want to delete this commons?")) {
      toast(`Commons with id ${commonsId} deleted`);
    }
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
          {commons &&
            commons.map((c) => (
              <Col key={c.commons.id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{c.commons.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      id: {c.commons.id}
                    </Card.Subtitle>
                    <Card.Text>
                      <strong>id:</strong> {c.commons.id}
                      <br />
                      <strong>Name:</strong> {c.commons.name}
                      <br />
                      <strong>Cow Price:</strong> {c.commons.cowPrice}
                      <br />
                      <strong>Milk Price:</strong> {c.commons.milkPrice}
                      <br />
                      <strong>Start Bal:</strong> {c.commons.startingBalance}
                      <br />
                      <strong>Starting Date:</strong>{" "}
                      {c.commons.startingDate
                        ? String(c.commons.startingDate).slice(0, 10)
                        : ""}
                      <br />
                      <strong>Last Date:</strong>{" "}
                      {c.commons.lastDate
                        ? String(c.commons.lastDate).slice(0, 10)
                        : ""}
                      <br />
                      <strong>Degrad Rate:</strong> {c.commons.degradationRate}
                      <br />
                      <strong>Show LrdrBrd?</strong>{" "}
                      {String(c.commons.showLeaderboard)}
                      <br />
                      <strong>Show Chat?</strong> {String(c.commons.showChat)}
                      <br />
                      <strong>Tot Cows:</strong> {c.totalCows}
                      <br />
                      <strong>Cap / User:</strong> {c.commons.capacityPerUser}
                      <br />
                      <strong>Carry Cap:</strong> {c.commons.carryingCapacity}
                      <br />
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
      </div>
    </BasicLayout>
  );
}
/* Stryker enable StringLiteral, BooleanLiteral, ArrayDeclaration, MethodExpression, ArrowFunction, ConditionalExpression */
