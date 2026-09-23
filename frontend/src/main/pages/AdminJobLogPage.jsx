import React from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "react-bootstrap";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "main/utils/useBackend";

// Full log for one job. The jobs table only shows a preview of the most
// recent lines (lib-jobs v0.2.0+ stores logs one row per line in job_logs);
// GET /api/jobs/logs/{id} returns the whole thing as plain text.
const AdminJobLogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Stryker disable all : hard to test for query caching
  const { data: jobLog } = useBackend([`/api/jobs/logs/${id}`], {
    method: "GET",
    url: `/api/jobs/logs/${id}`,
  });
  // Stryker restore all

  return (
    <BasicLayout>
      <Button
        onClick={() => navigate("/admin/jobs")}
        data-testid="AdminJobLogPage-back-button"
      >
        Back to Job List
      </Button>
      <h2 className="p-3">Log for Job {id}</h2>
      {jobLog === undefined ? (
        <p data-testid="AdminJobLogPage-loading">Loading...</p>
      ) : (
        <pre data-testid="AdminJobLogPage-log">{jobLog}</pre>
      )}
    </BasicLayout>
  );
};

export default AdminJobLogPage;
