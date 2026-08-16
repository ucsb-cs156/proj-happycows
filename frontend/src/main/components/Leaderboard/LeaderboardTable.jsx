import OurTable from "main/components/OurTable";
import PageSizeSelector from "main/components/Utils/PageSizeSelector";
import usePageSize from "main/utils/usePageSize";
import { Link } from "react-router";
import { Button } from "react-bootstrap";

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200, 500];
const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_STORAGE_KEY = "leaderboard-page-size";

// should take in a players list from a game. isAdminView (true only for an
// admin NOT viewing the leaderboard in "Student View" - see DashboardPage)
// and isCourseLinkedGame (activity is never tracked for a game with no
// course) together control whether the admin-only Activity column is shown
// at all; within that column, a farmer who isn't a student on the course's
// roster (row.student === false) gets "Not a student" instead of a button,
// since no activity is tracked for them either. See issue #291.
export default function LeaderboardTable({
  leaderboardUsers,
  isAdminView,
  isCourseLinkedGame,
}) {
  const [pageSize, handlePageSizeChange] = usePageSize({
    storageKey: PAGE_SIZE_STORAGE_KEY,
    options: PAGE_SIZE_OPTIONS,
    defaultPageSize: DEFAULT_PAGE_SIZE,
  });

  const USD = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const columns = [
    {
      Header: "Farmer",
      accessor: (row, _rowIndex) => {
        const url = `/admin/play/${row.gameId}/user/${row.userId}`;
        return <Link to={url}>{row.username}</Link>;
      },
    },
    ...(isAdminView && isCourseLinkedGame
      ? [
          {
            Header: "Activity",
            accessor: (row, _rowIndex) => {
              if (!row.student) {
                return (
                  <span
                    data-testid={`LeaderboardTable-cell-row-${_rowIndex}-col-Activity-not-a-student`}
                  >
                    Not a student
                  </span>
                );
              }
              const url = `/admin/farmeractivity/${row.gameId}/user/${row.userId}`;
              return (
                <Button
                  as={Link}
                  to={url}
                  variant="outline-secondary"
                  size="sm"
                  data-testid={`LeaderboardTable-cell-row-${_rowIndex}-col-Activity-button`}
                >
                  Activity
                </Button>
              );
            },
          },
        ]
      : []),
    {
      Header: "Total Wealth",
      accessor: "totalWealth",
      Cell: (props) => {
        return (
          <div style={{ textAlign: "right" }}>{USD.format(props.value)}</div>
        );
      },
    },
    {
      Header: "Cows Owned",
      accessor: "numOfCows",
      Cell: (props) => {
        return <div style={{ textAlign: "right" }}>{props.value}</div>;
      },
    },
    {
      Header: "Cow Health",
      accessor: "cowHealth",
      Cell: (props) => {
        return (
          <div style={{ textAlign: "right" }}>
            {typeof props.value === "number"
              ? props.value.toFixed(2)
              : props.value}
          </div>
        );
      },
    },
    {
      Header: "Cows Bought",
      accessor: "cowsBought",
      Cell: (props) => {
        return <div style={{ textAlign: "right" }}>{props.value}</div>;
      },
    },
    {
      Header: "Cows Sold",
      accessor: "cowsSold",
      Cell: (props) => {
        return <div style={{ textAlign: "right" }}>{props.value}</div>;
      },
    },
    {
      Header: "Cow Deaths",
      accessor: "cowDeaths",
      Cell: (props) => {
        return <div style={{ textAlign: "right" }}>{props.value}</div>;
      },
    },
  ];

  const testid = "LeaderboardTable";

  return (
    <>
      <PageSizeSelector
        value={pageSize}
        onChange={handlePageSizeChange}
        options={PAGE_SIZE_OPTIONS}
        testid={`${testid}-page-size-selector`}
      />
      <OurTable
        data={leaderboardUsers}
        columns={columns}
        testid={testid}
        pageSize={pageSize}
      />
    </>
  );
}
