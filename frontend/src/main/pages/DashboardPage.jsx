import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Row, Col, Card, Form, Button } from "react-bootstrap";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { hasRole, useCurrentUser } from "main/utils/currentUser";
import CountHistogram from "main/components/Utils/CountHistogram";
import BinSizeSelector from "main/components/Utils/BinSizeSelector";
import TimeSeries from "main/components/Utils/TimeSeries";
import DashboardSectionCard from "main/components/Dashboard/DashboardSectionCard";
import LeaderboardTable from "main/components/Leaderboard/LeaderboardTable";
import {
  fieldOrBlank,
  getGameId,
  getGameName,
  getIsHidden,
  getStartingDate,
  getDaysActive,
  numericFieldOrBlank,
} from "main/utils/dashboardUtils";

export default function DashboardPage() {
  const params = useParams();
  // Stryker disable next-line all : either param name may be used depending on the route
  const id = params.id ?? params.gameId;
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const isAdmin = hasRole(currentUser, "ROLE_ADMIN");

  const [binSize, setBinSize] = useState(10);
  const [viewAsStudent, setViewAsStudent] = useState(false);

  // Stryker disable all
  const { data: gamePlus } = useBackend(
    [`/api/game/plus?id=${id}`],
    {
      url: "/api/game/plus",
      params: { id },
    },
    null,
    { enabled: !!id },
  );
  // Stryker restore all

  const game = gamePlus?.game;

  // isAdminView is true only when an admin is looking at the dashboard in
  // its normal (non-"View as Student") mode.
  const isAdminView = isAdmin && !viewAsStudent;

  const showDashboardToStudents = game?.showLeaderboard === true;
  const showOverviewSection = game?.showOverviewSection !== false;
  const showCowsPerFarmerSection = game?.showCowsPerFarmerSection !== false;
  const showHistogramSection = game?.showHistogramSection !== false;
  const showTrendsSection = game?.showTrendsSection !== false;
  const showHealthSection = game?.showHealthSection !== false;
  const showTotalCowsSection = game?.showTotalCowsSection !== false;
  const showFarmerLeaderboardSection =
    game?.showFarmerLeaderboardSection !== false;

  const canSeeDashboard = isAdminView || showDashboardToStudents;

  // Stryker disable all
  const { data: numCowsData } = useBackend(
    [`/api/game/numcows?gameId=${id}`],
    {
      url: "/api/game/numcows",
      params: { gameId: id },
    },
    [],
    {
      enabled: !!id && canSeeDashboard && (isAdminView || showHistogramSection),
    },
  );
  // Stryker restore all

  // Stryker disable all
  const { data: timeSeriesData } = useBackend(
    [`/api/game/timeseries?commonId=${id}`],
    {
      url: "/api/game/timeseries",
      params: { commonId: id },
    },
    [],
    {
      enabled:
        !!id &&
        canSeeDashboard &&
        (isAdminView ||
          showTrendsSection ||
          showHealthSection ||
          showTotalCowsSection),
    },
  );
  // Stryker restore all

  // Stryker disable all
  const { data: farmer } = useBackend(
    [`/api/farmer/game/all?gameId=${id}`],
    {
      url: "/api/farmer/game/all",
      params: { gameId: id },
    },
    [],
    {
      enabled:
        !!id &&
        canSeeDashboard &&
        (isAdminView || showFarmerLeaderboardSection),
    },
  );
  // Stryker restore all

  // Stryker disable all : it is acceptable to exclude useBackendMutation calls from mutation testing
  const dashboardSettingsMutation = useBackendMutation(
    (settings) => ({
      url: "/api/game/dashboardSettings",
      method: "PUT",
      params: { id },
      data: settings,
    }),
    {},
    [`/api/game/plus?id=${id}`],
  );
  // Stryker restore all

  const updateDashboardSetting = (field, value) => {
    dashboardSettingsMutation.mutate({
      showLeaderboard: showDashboardToStudents,
      showOverviewSection: showOverviewSection,
      showCowsPerFarmerSection: showCowsPerFarmerSection,
      showHistogramSection: showHistogramSection,
      showTrendsSection: showTrendsSection,
      showHealthSection: showHealthSection,
      showTotalCowsSection: showTotalCowsSection,
      showFarmerLeaderboardSection: showFarmerLeaderboardSection,
      [field]: value,
    });
  };

  const totalFarmers = fieldOrBlank(gamePlus, "totalUsers");
  const totalCows = fieldOrBlank(gamePlus, "totalCows");
  const gameId = getGameId(gamePlus, id);

  const gameStartDate = getStartingDate(gamePlus);
  const daysActive = getDaysActive(gamePlus);

  const gameName = getGameName(gamePlus);
  const isHidden = getIsHidden(gamePlus);

  const averageCowsPerFarmer = numericFieldOrBlank(
    gamePlus,
    "averageCowsPerFarmer",
  );
  const medianCowsPerFarmer = numericFieldOrBlank(
    gamePlus,
    "medianCowsPerFarmer",
  );
  const minimumCowsPerFarmer = numericFieldOrBlank(
    gamePlus,
    "minimumCowsPerFarmer",
  );
  const maximumCowsPerFarmer = numericFieldOrBlank(
    gamePlus,
    "maximumCowsPerFarmer",
  );
  const standardDeviationCowsPerFarmer = numericFieldOrBlank(
    gamePlus,
    "standardDeviationCowsPerFarmer",
  );

  if (!gamePlus) {
    return (
      <BasicLayout>
        <h1>Loading...</h1>
      </BasicLayout>
    );
  }

  return (
    <BasicLayout>
      <div className="d-flex justify-content-between align-items-start">
        <h1 className="mb-1">
          {isHidden && <i className="fa-solid fa-eye-slash pe-5"></i>}
          {gameName}
        </h1>
        {isAdmin && (
          <Button
            data-testid="DashboardPage-back-button"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        )}
      </div>
      <h3 className="mb-4">Dashboard</h3>

      {isAdmin && (
        <Card className="mb-4 w-100" data-testid="DashboardPage-admin-controls">
          <Card.Body>
            <Row>
              <Col>
                <Form.Check
                  type="switch"
                  id="DashboardPage-showDashboard"
                  data-testid="DashboardPage-showDashboard"
                  label="Show Dashboard to Students"
                  checked={showDashboardToStudents}
                  onChange={(e) =>
                    updateDashboardSetting("showLeaderboard", e.target.checked)
                  }
                />
              </Col>
              <Col>
                <Form.Check
                  type="switch"
                  id="DashboardPage-viewAsStudent"
                  data-testid="DashboardPage-viewAsStudent"
                  label="View as Student"
                  checked={viewAsStudent}
                  onChange={(e) => setViewAsStudent(e.target.checked)}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {!canSeeDashboard && <p>You're not authorized to see the dashboard.</p>}

      {canSeeDashboard && (
        <>
          <DashboardSectionCard
            title="Overview"
            visible={showOverviewSection}
            isAdminView={isAdminView}
            onToggleVisible={(v) =>
              updateDashboardSetting("showOverviewSection", v)
            }
            testid="DashboardPage-OverviewSection"
          >
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
                    <Card.Text>{gameId}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col>
                <Card className="mb-3">
                  <Card.Body>
                    <Card.Title>Start Date</Card.Title>
                    <Card.Text>{gameStartDate}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Cows Per Farmer"
            visible={showCowsPerFarmerSection}
            isAdminView={isAdminView}
            onToggleVisible={(v) =>
              updateDashboardSetting("showCowsPerFarmerSection", v)
            }
            testid="DashboardPage-CowsPerFarmerSection"
          >
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
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Cows Per Farmer Histogram"
            visible={showHistogramSection}
            isAdminView={isAdminView}
            onToggleVisible={(v) =>
              updateDashboardSetting("showHistogramSection", v)
            }
            testid="DashboardPage-HistogramSection"
          >
            <CountHistogram
              data={numCowsData}
              s={binSize}
              xLabel="Cows"
              yLabel="Farmers"
            />
            <BinSizeSelector value={binSize} onChange={setBinSize} />
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Trends Over Time"
            visible={showTrendsSection}
            isAdminView={isAdminView}
            onToggleVisible={(v) =>
              updateDashboardSetting("showTrendsSection", v)
            }
            testid="DashboardPage-TrendsSection"
          >
            <TimeSeries data={timeSeriesData} selectors="all" />
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Health Over Time"
            visible={showHealthSection}
            isAdminView={isAdminView}
            onToggleVisible={(v) =>
              updateDashboardSetting("showHealthSection", v)
            }
            testid="DashboardPage-HealthSection"
          >
            <TimeSeries
              data={timeSeriesData}
              selectors="Health"
              testid="DashboardPage-HealthSection-time-series"
            />
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Total Cows Over Time"
            visible={showTotalCowsSection}
            isAdminView={isAdminView}
            onToggleVisible={(v) =>
              updateDashboardSetting("showTotalCowsSection", v)
            }
            testid="DashboardPage-TotalCowsSection"
          >
            <TimeSeries
              data={timeSeriesData}
              selectors="Total Cows"
              testid="DashboardPage-TotalCowsSection-time-series"
            />
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Leaderboard"
            visible={showFarmerLeaderboardSection}
            isAdminView={isAdminView}
            onToggleVisible={(v) =>
              updateDashboardSetting("showFarmerLeaderboardSection", v)
            }
            testid="DashboardPage-LeaderboardSection"
          >
            <LeaderboardTable
              leaderboardUsers={farmer}
              currentUser={currentUser}
              isAdminView={isAdminView}
            />
          </DashboardSectionCard>
        </>
      )}
    </BasicLayout>
  );
}
