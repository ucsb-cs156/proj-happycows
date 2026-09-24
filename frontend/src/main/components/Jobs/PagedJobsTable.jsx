import React from "react";
import OurTable, { DateColumn } from "main/components/OurTable";
import Plaintext from "main/components/Utils/Plaintext";
import { Button } from "react-bootstrap";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { useBackend, useBackendMutation } from "main/utils/useBackend";

// lib-jobs job cancellation (POST /api/jobs/{id}/cancel): a queued job is
// killed immediately; a running job is marked "cancelling" and stops at its
// next ctx.log() checkpoint. Any other status is terminal.
const CANCELLABLE_STATUSES = ["queued", "running"];

const PagedJobsTable = () => {
  const testId = "PagedJobsTable";
  const refreshJobsIntervalMilliseconds = 5000;

  const [selectedPage, setSelectedPage] = React.useState(0);

  const pageSize = 10;

  // Stryker disable all
  const { data: page } = useBackend(
    ["/api/jobs/all"],
    {
      method: "GET",
      url: "/api/jobs/paginated",
      params: {
        page: selectedPage,
        pageSize: pageSize,
        sortField: "id",
        sortDirection: "DESC",
      },
    },
    { content: [], totalPages: 0 },
    { refetchInterval: refreshJobsIntervalMilliseconds },
  );
  // Stryker restore  all

  const cellToAxiosParamsCancel = (cell) => ({
    url: `/api/jobs/${cell.row.original.id}/cancel`,
    method: "POST",
  });

  const cancelSuccess = () => {
    toast("Cancellation requested.");
  };

  // Stryker disable all : hard to test for query caching
  const cancelMutation = useBackendMutation(
    cellToAxiosParamsCancel,
    { onSuccess: cancelSuccess },
    ["/api/jobs/all"],
  );
  // Stryker restore all

  const cancelCallback = (cell) => {
    cancelMutation.mutate(cell);
  };

  const testid = "PagedJobsTable";

  const previousPageCallback = () => {
    return () => {
      setSelectedPage(selectedPage - 1);
    };
  };

  const nextPageCallback = () => {
    return () => {
      setSelectedPage(selectedPage + 1);
    };
  };

  const columns = [
    {
      Header: "id",
      accessor: "id", // accessor is the "key" in the data
    },
    DateColumn("Created", (cell) => cell.row.original.createdAt),
    DateColumn("Updated", (cell) => cell.row.original.updatedAt),
    {
      Header: "Status",
      accessor: "status",
    },
    {
      Header: "Cancel",
      // Stryker disable next-line StringLiteral : react-table falls back to the Header when id is empty, so the mutant is equivalent
      id: "Cancel",
      Cell: ({ cell }) =>
        CANCELLABLE_STATUSES.includes(cell.row.original.status) ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => cancelCallback(cell)}
            data-testid={`${testId}-cell-row-${cell.row.index}-col-Cancel-button`}
          >
            Cancel
          </Button>
        ) : null,
    },
    {
      // Since lib-jobs v0.2.0 the log in a list/paginated response is only a
      // preview (the most recent lines); the full log lives in job_logs and
      // is served by GET /api/jobs/logs/{id}.
      Header: "Log",
      // Stryker disable next-line StringLiteral : react-table falls back to the Header when id is empty, so the mutant is equivalent
      id: "Log",
      Cell: ({ cell }) => (
        <>
          <Plaintext text={cell.row.original.log} />
          <Link
            to={`/admin/jobs/logs/${cell.row.original.id}`}
            data-testid={`${testId}-cell-row-${cell.row.index}-col-Log-link`}
          >
            See entire log
          </Link>
        </>
      ),
    },
  ];

  const sortees = React.useMemo(
    () => [
      {
        id: "id",
        desc: true,
      },
    ],
    // Stryker disable next-line all
    [],
  );

  return (
    <>
      <p>Page: {selectedPage + 1}</p>
      <Button
        data-testid={`${testId}-previous-button`}
        onClick={previousPageCallback()}
        disabled={selectedPage === 0}
      >
        Previous
      </Button>
      <Button
        data-testid={`${testId}-next-button`}
        onClick={nextPageCallback()}
        disabled={page.totalPages === 0 || selectedPage === page.totalPages - 1}
      >
        Next
      </Button>
      <OurTable
        data={page.content}
        columns={columns}
        testid={testid}
        initialState={{ sortBy: sortees }}
      />
    </>
  );
};

export default PagedJobsTable;
