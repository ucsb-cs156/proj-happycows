import React, { useState } from "react";
import { Link } from "react-router";
import OurTable from "main/components/OurTable";
import PageSizeSelector from "main/components/Utils/PageSizeSelector";
import { useBackend } from "main/utils/useBackend";
import { formatPacificTimestamp } from "main/utils/dateUtils";

const ACTIVITY_TYPE_LABELS = {
  0: "Viewed Play Page",
  1: "Bought Cows",
  2: "Sold Cows",
};

export default function FarmerActivityTable({
  gameId,
  userId,
  testid = "FarmerActivityTable",
}) {
  const [pageSize, setPageSize] = useState(10);

  // When userId isn't given, this table shows activity for the whole game
  // (see AdminGameActivityPage) rather than for a single farmer.
  const showFarmerName = userId === undefined;
  const url = showFarmerName
    ? "/api/farmeractivity/game"
    : "/api/farmeractivity/all";
  const params = showFarmerName
    ? { gameId: gameId }
    : { userId: userId, gameId: gameId };

  // The query key is only used internally by react-query for cache lookups
  // and isn't otherwise observable in the rendered output, so it's excluded
  // from mutation testing (see the `url`/`params` above, which drive the
  // actual request and are asserted on directly).
  // Stryker disable all
  const queryKey = showFarmerName
    ? `/api/farmeractivity/game?gameId=${gameId}`
    : `/api/farmeractivity/all?userId=${userId}&gameId=${gameId}`;

  const { data: activity } = useBackend(
    [queryKey],
    {
      method: "GET",
      url: url,
      params: params,
    },
    [],
  );
  // Stryker restore all

  const columns = [
    ...(showFarmerName
      ? [
          {
            Header: "Farmer Name",
            accessor: (row) => row.farmer?.username,
            Cell: ({ row }) => {
              const farmer = row.original.farmer;
              if (!farmer) {
                return "";
              }
              const farmerUrl = `/admin/farmeractivity/${farmer.gameId}/user/${farmer.userId}`;
              return <Link to={farmerUrl}>{farmer.username}</Link>;
            },
          },
        ]
      : []),
    {
      Header: "Timestamp",
      accessor: "timestamp",
      Cell: ({ value }) => formatPacificTimestamp(value),
    },
    {
      Header: "Activity",
      accessor: "activityType",
      Cell: ({ value }) => ACTIVITY_TYPE_LABELS[value] ?? value,
    },
    {
      Header: "Cows",
      accessor: "numCows",
    },
  ];

  return (
    <>
      <PageSizeSelector
        value={pageSize}
        onChange={setPageSize}
        options={[10, 50, 100]}
        testid={`${testid}-page-size-selector`}
      />
      <OurTable
        data={activity}
        columns={columns}
        testid={testid}
        centered={false}
        pageSize={pageSize}
      />
    </>
  );
}
