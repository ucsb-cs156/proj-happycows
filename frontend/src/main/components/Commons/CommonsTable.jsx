import React, { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Stack,
} from "react-bootstrap";
import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/commonsUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/currentUser";
import {
  computeEffectiveCapacity,
  createCommonsComparator,
  formatBoolean,
  formatDate,
  formatPlain,
} from "./commonsTableUtils";

// helper functions moved to ./commonsTableUtils to satisfy react-refresh rule

export default function CommonsTable({ commons, currentUser }) {
  const [showModal, setShowModal] = useState(false);
  const [commonsToDelete, setCommonsToDelete] = useState(null);
  const [sortKey, setSortKey] = useState("commons.id");
  const [sortDirection, setSortDirection] = useState("asc");

  const navigate = useNavigate();

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/commons/allplus"],
  );

  const isAdmin = hasRole(currentUser, "ROLE_ADMIN");

  const handleEdit = (commonsId) => {
    navigate(`/admin/editcommons/${commonsId}`);
  };

  const handleDelete = (commonsPlus) => {
    setCommonsToDelete(commonsPlus);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!commonsToDelete) return;
    deleteMutation.mutate({
      row: {
        values: {
          "commons.id": commonsToDelete.commons.id,
        },
      },
    });
    setShowModal(false);
    setCommonsToDelete(null);
  };

  const handleLeaderboard = (commonsId) => {
    navigate(`/leaderboard/${commonsId}`);
  };

  const validSortKey = SORT_FIELDS.some((field) => field.key === sortKey)
    ? sortKey
    : "commons.id";

  const comparator = useMemo(
    () => createCommonsComparator(validSortKey, sortDirection),
    [validSortKey, sortDirection],
  );

  const sortedCommons = useMemo(() => {
    const sorted = [...commons];
    sorted.sort(comparator);
    return sorted;
  }, [commons, comparator]);

  const cards = sortedCommons.map((commonsPlus, index) => {
    const { commons: commonsData, totalCows } = commonsPlus;
    const {
      id,
      name,
      cowPrice,
      milkPrice,
      startingBalance,
      startingDate,
      lastDate,
      degradationRate,
      capacityPerUser,
      carryingCapacity,
      showLeaderboard,
      showChat,
    } = commonsData;

    const computedEffectiveCapacity = computeEffectiveCapacity(commonsPlus);

    return (
      <Card
        key={id}
        data-testid={`CommonsTable-card-${index}`}
        className="shadow-sm border-0"
      >
        <Card.Header className="bg-transparent border-0 pb-0">
          <Stack
            direction="horizontal"
            className="flex-column flex-lg-row gap-3 align-items-start align-items-lg-center justify-content-between"
          >
            <div>
              <div
                data-testid={`CommonsTable-card-${index}-name`}
                className="h5 mb-1"
              >
                {/* Keep existing test id for unit tests, and add the expected test id for integration tests */}
                <span
                  data-testid={`CommonsTable-card-${index}-field-commons.name`}
                >
                  {name}
                </span>
              </div>
              <div className="text-muted small">
                <span className="me-1">ID#</span>
                <span
                  data-testid={`CommonsTable-card-${index}-field-commons.id`}
                >
                  {id}
                </span>
              </div>
            </div>
            <Stack
              direction="horizontal"
              gap={2}
              className="flex-wrap"
              data-testid={`CommonsTable-card-${index}-summary`}
            >
              <Badge
                bg="secondary"
                data-testid={`CommonsTable-card-${index}-totalCows`}
              >
                Tot Cows: {formatPlain(totalCows)}
              </Badge>
              <Badge
                bg="secondary"
                data-testid={`CommonsTable-card-${index}-effectiveCapacity`}
              >
                Eff Cap: {formatPlain(computedEffectiveCapacity)}
              </Badge>
            </Stack>
          </Stack>
        </Card.Header>
        <Card.Body className="pt-3">
          <Row className="gy-3">
            <Col lg={6}>
              <h6 className="text-uppercase text-muted small mb-2">
                Economic Overview
              </h6>
              <dl className="row mb-0">
                <dt className="col-sm-5 text-muted small">Start Bal</dt>
                <dd
                  className="col-sm-7 fw-semibold"
                  data-testid={`CommonsTable-card-${index}-field-commons.startingBalance`}
                >
                  {formatPlain(startingBalance)}
                </dd>
                <dt className="col-sm-5 text-muted small">Cow Price</dt>
                <dd
                  className="col-sm-7 fw-semibold"
                  data-testid={`CommonsTable-card-${index}-field-commons.cowPrice`}
                >
                  {formatPlain(cowPrice)}
                </dd>
                <dt className="col-sm-5 text-muted small">Milk Price</dt>
                <dd
                  className="col-sm-7 fw-semibold"
                  data-testid={`CommonsTable-card-${index}-field-commons.milkPrice`}
                >
                  {formatPlain(milkPrice)}
                </dd>
                <dt className="col-sm-5 text-muted small">Degrad Rate</dt>
                <dd
                  className="col-sm-7 fw-semibold"
                  data-testid={`CommonsTable-card-${index}-field-commons.degradationRate`}
                >
                  {formatPlain(degradationRate)}
                </dd>
                <dt className="col-sm-5 text-muted small">Tot Cows</dt>
                <dd
                  className="col-sm-7 fw-semibold"
                  data-testid={`CommonsTable-card-${index}-field-totalCows`}
                >
                  {formatPlain(totalCows)}
                </dd>
              </dl>
            </Col>
            <Col lg={6}>
              <h6 className="text-uppercase text-muted small mb-2">
                Timeline & Capacity
              </h6>
              <dl className="row mb-0">
                <dt className="col-sm-5 text-muted small">Starting Date</dt>
                <dd
                  className="col-sm-7 fw-semibold"
                  data-testid={`CommonsTable-card-${index}-field-commons.startingDate`}
                >
                  {formatDate(startingDate)}
                </dd>
                <dt className="col-sm-5 text-muted small">Last Date</dt>
                <dd
                  className="col-sm-7 fw-semibold"
                  data-testid={`CommonsTable-card-${index}-field-commons.lastDate`}
                >
                  {formatDate(lastDate)}
                </dd>
                <dt className="col-sm-5 text-muted small">Cap / User</dt>
                <dd
                  className="col-sm-7 fw-semibold"
                  data-testid={`CommonsTable-card-${index}-field-commons.capacityPerUser`}
                >
                  {formatPlain(capacityPerUser)}
                </dd>
                <dt className="col-sm-5 text-muted small">Carry Cap</dt>
                <dd
                  className="col-sm-7 fw-semibold"
                  data-testid={`CommonsTable-card-${index}-field-commons.carryingCapacity`}
                >
                  {formatPlain(carryingCapacity)}
                </dd>
                <dt className="col-sm-5 text-muted small">Show LrdrBrd?</dt>
                <dd
                  className="col-sm-7 fw-semibold"
                  data-testid={`CommonsTable-card-${index}-field-commons.showLeaderboard`}
                >
                  {formatBoolean(showLeaderboard)}
                </dd>
                <dt className="col-sm-5 text-muted small">Show Chat</dt>
                <dd
                  className="col-sm-7 fw-semibold"
                  data-testid={`CommonsTable-card-${index}-field-commons.showChat`}
                >
                  {formatBoolean(showChat)}
                </dd>
                <dt className="col-sm-5 text-muted small">Eff Cap</dt>
                <dd
                  className="col-sm-7 fw-semibold"
                  data-testid={`CommonsTable-card-${index}-field-effectiveCapacity`}
                >
                  {formatPlain(computedEffectiveCapacity)}
                </dd>
              </dl>
            </Col>
          </Row>
          {isAdmin && (
            <Stack
              direction="horizontal"
              gap={2}
              className="flex-wrap mt-3"
              data-testid={`CommonsTable-card-${index}-actions`}
            >
              <Button
                variant="primary"
                size="sm"
                data-testid={`CommonsTable-card-${index}-action-Edit`}
                onClick={() => handleEdit(id)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                data-testid={`CommonsTable-card-${index}-action-Delete`}
                onClick={() => handleDelete(commonsPlus)}
              >
                Delete
              </Button>
              <Button
                variant="secondary"
                size="sm"
                data-testid={`CommonsTable-card-${index}-action-Leaderboard`}
                onClick={() => handleLeaderboard(id)}
              >
                Leaderboard
              </Button>
              <Button
                variant="success"
                size="sm"
                data-testid={`CommonsTable-card-${index}-action-StatsCSV`}
                href={`/api/commonstats/download?commonsId=${id}`}
              >
                Stats CSV
              </Button>
              <Button
                variant="info"
                size="sm"
                data-testid={`CommonsTable-card-${index}-action-Announcements`}
                href={`/admin/announcements/${id}`}
              >
                Announcements
              </Button>
            </Stack>
          )}
        </Card.Body>
      </Card>
    );
  });

  const commonsModal = (
    <Modal
      data-testid="CommonsTable-Modal"
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
          data-testid="CommonsTable-Modal-Cancel"
          onClick={() => setShowModal(false)}
        >
          Keep this Commons
        </Button>
        <Button
          variant="danger"
          data-testid="CommonsTable-Modal-Delete"
          onClick={() => confirmDelete()}
        >
          Permanently Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <>
      {commons.length === 0 ? (
        <Alert
          variant="light"
          data-testid="CommonsTable-empty"
          className="border border-dashed"
        >
          No commons available at the moment.
        </Alert>
      ) : (
        <>
          <Stack
            direction="horizontal"
            className="flex-column flex-md-row gap-3 align-items-start align-items-md-end mb-3"
          >
            <Form.Group controlId="CommonsTable-sort-select-group">
              <Form.Label className="text-muted small mb-1">Sort By</Form.Label>
              <Form.Select
                size="sm"
                value={validSortKey}
                onChange={(event) => setSortKey(event.target.value)}
                data-testid="CommonsTable-sort-select"
                data-current-sort={sortKey}
              >
                {SORT_FIELDS.map((field) => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button
              variant="outline-secondary"
              size="sm"
              data-testid="CommonsTable-sort-direction-toggle"
              data-current-direction={sortDirection}
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
            >
              {sortDirection === "asc" ? "Ascending" : "Descending"}
            </Button>
          </Stack>
          <Stack gap={3} data-testid="CommonsTable-card-list">
            {cards}
          </Stack>
        </>
      )}
      {isAdmin && commonsModal}
    </>
  );
}

const SORT_FIELDS = [
  { key: "commons.id", label: "id" },
  { key: "commons.name", label: "Name" },
  { key: "commons.cowPrice", label: "Cow Price" },
  { key: "commons.milkPrice", label: "Milk Price" },
  { key: "commons.startingBalance", label: "Start Bal" },
  { key: "commons.startingDate", label: "Starting Date" },
  { key: "commons.lastDate", label: "Last Date" },
  { key: "commons.degradationRate", label: "Degrad Rate" },
  { key: "commons.showLeaderboard", label: "Show LrdrBrd?" },
  { key: "commons.showChat", label: "Show Chat?" },
  { key: "totalCows", label: "Tot Cows" },
  { key: "commons.capacityPerUser", label: "Cap / User" },
  { key: "commons.carryingCapacity", label: "Carry Cap" },
  { key: "effectiveCapacity", label: "Eff Cap" },
];
