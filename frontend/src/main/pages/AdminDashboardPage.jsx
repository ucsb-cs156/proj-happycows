import React from "react";
import { useParams } from "react-router";
import { Row, Col, Card } from "react-bootstrap";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "main/utils/useBackend";
import { daysSinceTimestamp, timestampToDate } from "main/utils/dateUtils";

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
  const commonsId = commonsPlus?.commons?.id ?? id ?? "--";
  const commonsStartDate = commonsPlus?.commons?.startingDate
    ? timestampToDate(commonsPlus.commons.startingDate)
    : "--";
  const commonsName = commonsPlus?.commons?.name ?? "--";
  const isHidden = commonsPlus?.commons?.hidden === true;
  const formatOneDecimal = (value) => {
    if (value === null || value === undefined) return "--";
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? "--" : numericValue.toFixed(1);
  };
  const averageCowsPerFarmer = formatOneDecimal(
    commonsPlus?.averageCowsPerFarmer,
  );
  const medianCowsPerFarmer = formatOneDecimal(
    commonsPlus?.medianCowsPerFarmer,
  );
  const minimumCowsPerFarmer = formatOneDecimal(
    commonsPlus?.minimumCowsPerFarmer,
  );
  const maximumCowsPerFarmer = formatOneDecimal(
    commonsPlus?.maximumCowsPerFarmer,
  );
  const standardDeviationCowsPerFarmer = formatOneDecimal(
    commonsPlus?.standardDeviationCowsPerFarmer,
  );

  return (
    <BasicLayout>
      <h1 className="mb-1">
        {isHidden && (
          <>
            <i className="fa-solid fa-eye-slash"></i>{" "}
          </>
        )}
        {commonsName}
      </h1>
      <h3 className="mb-4">Dashboard</h3>

      <h3 className="mt-4">Overview</h3>
      <Row>
        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Total Farmers</Card.Title>
              <Card.Text>{totalFarmers}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Total Cows</Card.Title>
              <Card.Text>{totalCows}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Days Active</Card.Title>
              <Card.Text>{daysActive}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>ID</Card.Title>
              <Card.Text>{commonsId}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Start Date</Card.Title>
              <Card.Text>{commonsStartDate}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h3 className="mt-4">Farmer Cow Distribution</h3>
      <Row>
        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Average Number of Cows per Farmer</Card.Title>
              <Card.Text>{averageCowsPerFarmer}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Median Number of Cows per Farmer</Card.Title>
              <Card.Text>{medianCowsPerFarmer}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Minimum Number of Cows per Farmer</Card.Title>
              <Card.Text>{minimumCowsPerFarmer}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Maximum Number of Cows per Farmer</Card.Title>
              <Card.Text>{maximumCowsPerFarmer}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>
                Standard Deviation of Number of Cows per Farmer
              </Card.Title>
              <Card.Text>{standardDeviationCowsPerFarmer}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
    </BasicLayout>
  );
}
