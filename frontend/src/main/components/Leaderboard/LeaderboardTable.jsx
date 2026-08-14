import OurTable from "main/components/OurTable";
import { Link } from "react-router";
import { Button } from "react-bootstrap";

// should take in a players list from a game. isAdminView (true only for an
// admin NOT viewing the leaderboard in "Student View" - see DashboardPage)
// controls whether the admin-only Activity column is shown, per issue #291.
export default function LeaderboardTable({ leaderboardUsers, isAdminView }) {
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
    ...(isAdminView
      ? [
          {
            Header: "Activity",
            accessor: (row, _rowIndex) => {
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

  return <OurTable data={leaderboardUsers} columns={columns} testid={testid} />;
}
