import React from "react";
import { useParams } from "react-router";
import { Row, Col, Card } from "react-bootstrap";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "main/utils/useBackend";
import { daysSinceTimestamp } from "main/utils/dateUtils";

export default function AdminDashboardPage() {
  const { id } = useParams();
  const { data: commonsPlus } = useBackend(
    [`/api/commons/plus?id=${id}`],
    {
      url: "/api/commons/plus",
      params: {
        id,
      },
    },
    null,
    {
      enabled: !!id,
    },
  );

  const totalFarmers = commonsPlus?.totalUsers ?? "--";
  const totalCows = commonsPlus?.totalCows ?? "--";
  const daysActive = commonsPlus?.commons?.startingDate
    ? daysSinceTimestamp(commonsPlus.commons.startingDate)
    : "--";

  return (
    <BasicLayout>
      <h1 className="mb-4">Dashboard</h1>

      <p>
        <strong>Commons ID:</strong> {id}
      </p>

      <h3 className="mt-4">Overview</h3>
      <Row>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Total Farmers</Card.Title>
              <Card.Text>{totalFarmers}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Total Cows</Card.Title>
              <Card.Text>{totalCows}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Days Active</Card.Title>
              <Card.Text>{daysActive}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h3 className="mt-4">Commons Details</h3>
      <Card className="mb-3">
        <Card.Body>
          <p>
            <strong>Name:</strong> --
          </p>
          <p>
            <strong>Status:</strong> --
          </p>
          <p>
            <strong>Start Date:</strong> --
          </p>
        </Card.Body>
      </Card>

      <h3 className="mt-4">Participation Metrics</h3>
      <Card className="mb-3">
        <Card.Body>
          <p>
            <strong>Active Farmers:</strong> --
          </p>
          <p>
            <strong>Inactive Farmers:</strong> --
          </p>
          <p>
            <strong>Avg Cows per Farmer:</strong> --
          </p>
        </Card.Body>
      </Card>

      <h3 className="mt-4">Farmer Cow Distribution</h3>
      <Card className="mb-3">
        <Card.Body>
          <p>Histogram / distribution of cows per farmer will go here</p>
        </Card.Body>
      </Card>

      <h3 className="mt-4">Trends Over Time</h3>
      <Row>
        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Cows Over Time</Card.Title>
              <p>Chart placeholder (x-axis: days since commons start)</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Farmers Over Time</Card.Title>
              <p>Chart placeholder (x-axis: days since commons start)</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h3 className="mt-4">Additional Insights</h3>
      <Card className="mb-3">
        <Card.Body>
          <p>Future analytics and breakdowns will be added here.</p>
        </Card.Body>
      </Card>
    </BasicLayout>
  );
}
