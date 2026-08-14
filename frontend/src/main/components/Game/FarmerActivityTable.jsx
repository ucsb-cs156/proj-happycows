import React, { useState } from "react";
import OurTable from "main/components/OurTable";
import PageSizeSelector from "main/components/Utils/PageSizeSelector";
import { useBackend } from "main/utils/useBackend";

const ACTIVITY_TYPE_LABELS = {
  0: "Viewed Play Page",
  1: "Bought Cows",
  2: "Sold Cows",
};

// The backend stores/serializes this as a naive "YYYY-MM-DDTHH:mm:ss"
// LocalDateTime that's already in Pacific time (see FarmerActivityService).
// Format its digits directly rather than going through `new Date(...)`: a
// date-time string with no timezone offset is parsed by JS using the
// *viewing browser's* local timezone, which would silently show the wrong
// time for anyone not physically in the Pacific timezone. See issue #291.
function formatPacificTimestamp(dateTimeString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(dateTimeString);
  if (!match) {
    return "";
  }
  const [, year, month, day, hour24Str, minute] = match;
  const hour24 = Number(hour24Str);
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = ((hour24 + 11) % 12) + 1;
  return `${month}/${day}/${year}, ${hour12}:${minute} ${period}`;
}

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
