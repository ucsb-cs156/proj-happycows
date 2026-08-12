import React from "react";
import OurTable from "main/components/OurTable";
import { Button } from "react-bootstrap";
import { useBackend } from "main/utils/useBackend";
import { useParams } from "react-router";
import { timestampToDate } from "main/utils/dateUtils";

const PagedProfitsTable = () => {
  const testId = "PagedProfitsTable";
  const refreshJobsIntervalMilliseconds = 5000;

  const [selectedPage, setSelectedPage] = React.useState(0);

  const PROFIT_PAGE_SIZE = 5;
  const { gameId, userId } = useParams();

  // A :userId route param means we're on the admin read-only view
  // (/admin/play/:gameId/user/:userId) looking at another farmer's page, so
  // we need the admin endpoint that takes an explicit userId instead of the
  // current-user endpoint, which would otherwise return the logged-in
  // admin's own profits (or 404, since the admin usually isn't a farmer in
  // this game at all).
  const isAdminView = userId !== undefined;

  // Stryker disable all
  const { data: page } = useBackend(
    [isAdminView ? "/api/profits/paged" : "/api/profits/paged/gameid"],
    {
      method: "GET",
      url: isAdminView ? "/api/profits/paged" : "/api/profits/paged/gameid",
      params: {
        ...(isAdminView && { userId: userId }),
        gameId: gameId,
        pageNumber: selectedPage,
        pageSize: PROFIT_PAGE_SIZE,
      },
    },
    { content: [], totalPages: 0 },
    { refetchInterval: refreshJobsIntervalMilliseconds },
  );
  // Stryker restore  all

  const testid = "PagedProfitsTable";

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
      Header: "Profit",
      accessor: "amount",
      Cell: ({ value }) => `$${value.toFixed(2)}`,
      width: 200,
    },
    {
      Header: "Date",
      accessor: "timestamp",
      Cell: ({ value }) => timestampToDate(value),
      width: 200,
    },
    {
      Header: "Health",
      accessor: "avgCowHealth",
      Cell: ({ value }) => `${value.toFixed(2) + "%"}`,
      width: 200,
    },
    {
      Header: "Cows",
      accessor: "numCows",
      width: 200,
    },
  ];

  const sortees = React.useMemo(
    () => [
      {
        id: "timestamp",
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
      <div
        data-testid="PagedProfitsTable-CSS"
        style={{
          display: "flex",
          overflow: "auto",
        }}
      >
        <OurTable
          data={page.content}
          columns={columns}
          testid={testid}
          initialState={{ sortBy: sortees }}
        />
      </div>
    </>
  );
};

export default PagedProfitsTable;
