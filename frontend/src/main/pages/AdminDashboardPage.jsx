import React, { useMemo, useState } from "react";
import { useParams } from "react-router";
import { Row, Col, Card } from "react-bootstrap";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "main/utils/useBackend";
import CountHistogram from "main/components/Utils/CountHistogram";
import BinSizeSelector from "main/components/Utils/BinSizeSelector";
import TimeSeries from "main/components/Utils/TimeSeries";
import {
  fieldOrBlank,
  getCommonsId,
  getCommonsName,
  getIsHidden,
  getStartingDate,
  getDaysActive,
  numericFieldOrBlank,
} from "main/utils/dashboardUtils";

export default function AdminDashboardPage() {
  const { id } = useParams();
  const [binSize, setBinSize] = useState(10);
  const numCowsQueryParams = useMemo(() => ({ commonsId: id }), [id]);
  // API endpoint uses `commonId` (without s) for this route.
  const timeSeriesQueryParams = useMemo(() => ({ commonId: id }), [id]);
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

  const totalFarmers = fieldOrBlank(commonsPlus, "totalUsers");
  const totalCows = fieldOrBlank(commonsPlus, "totalCows");
  const commonsId = getCommonsId(commonsPlus, id);

  const commonsStartDate = getStartingDate(commonsPlus);
  const daysActive = getDaysActive(commonsPlus);

  const commonsName = getCommonsName(commonsPlus);
  const isHidden = getIsHidden(commonsPlus);

  const averageCowsPerFarmer = numericFieldOrBlank(
    commonsPlus,
    "averageCowsPerFarmer",
  );
  const medianCowsPerFarmer = numericFieldOrBlank(
    commonsPlus,
    "medianCowsPerFarmer",
  );
  const minimumCowsPerFarmer = numericFieldOrBlank(
    commonsPlus,
    "minimumCowsPerFarmer",
  );
  const maximumCowsPerFarmer = numericFieldOrBlank(
    commonsPlus,
    "maximumCowsPerFarmer",
  );
  const standardDeviationCowsPerFarmer = numericFieldOrBlank(
    commonsPlus,
    "standardDeviationCowsPerFarmer",
  );

  const { data: numCowsData } = useBackend(
    // Stryker disable next-line all : this is for React Query caching, which is hard to test
    [`/api/commons/numcows?commonsId=${id}`],
    {
      url: "/api/commons/numcows",
      params: numCowsQueryParams,
    },
    // Stryker disable next-line all : this is for React Query caching, which is hard to test
    [],
    // Stryker disable next-line all : this is for React Query caching, which is hard to test
    { enabled: !!id },
  );

  const { data: timeSeriesData } = useBackend(
    // Stryker disable next-line all : this is for React Query caching, which is hard to test
    [`/api/commons/timeseries?commonId=${id}`],
    {
      url: "/api/commons/timeseries",
      params: timeSeriesQueryParams,
    },
    [],
    // Stryker disable next-line all : this is for React Query caching, which is hard to test
    { enabled: !!id },
  );

  return (
    <BasicLayout>
      <h1 className="mb-1">
        {isHidden && (
          <>
            <i className="fa-solid fa-eye-slash pe-5"></i>
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

      <h3 className="mt-4">Cows Per Farmer</h3>
      <Row>
        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Average</Card.Title>
              <Card.Text>{averageCowsPerFarmer}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Median</Card.Title>
              <Card.Text>{medianCowsPerFarmer}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Min</Card.Title>
              <Card.Text>{minimumCowsPerFarmer}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Max</Card.Title>
              <Card.Text>{maximumCowsPerFarmer}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>StdDev</Card.Title>
              <Card.Text>{standardDeviationCowsPerFarmer}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-3">
        <Card.Body>
          <CountHistogram
            data={numCowsData}
            s={binSize}
            xLabel="Cows"
            yLabel="Farmers"
          />
          <BinSizeSelector value={binSize} onChange={setBinSize} />
        </Card.Body>
      </Card>

      <h3 className="mt-4">Trends Over Time</h3>
      <Card className="mb-3">
        <Card.Body>
          <TimeSeries data={timeSeriesData} />
        </Card.Body>
      </Card>
    </BasicLayout>
  );
}
