import React, { useState } from "react";
import OurTable from "main/components/OurTable";
import PageSizeSelector from "main/components/Utils/PageSizeSelector";
import { useBackend } from "main/utils/useBackend";
import { formatDateTime } from "main/utils/dateUtils";

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

  // Stryker disable all
  const { data: activity } = useBackend(
    [`/api/farmeractivity/all?userId=${userId}&gameId=${gameId}`],
    {
      method: "GET",
      url: "/api/farmeractivity/all",
      params: {
        userId: userId,
        gameId: gameId,
      },
    },
    [],
  );
  // Stryker restore all

  const columns = [
    {
      Header: "Timestamp",
      accessor: "timestamp",
      Cell: ({ value }) => formatDateTime(value),
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
