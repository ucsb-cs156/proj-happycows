import { useState } from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import PageSizeSelector from "main/components/Utils/PageSizeSelector";
import { useNavigate } from "react-router";

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200, 500];
const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_STORAGE_KEY = "reports-page-size";

const getInitialPageSize = () => {
  const storedValue = parseInt(localStorage.getItem(PAGE_SIZE_STORAGE_KEY), 10);
  if (PAGE_SIZE_OPTIONS.includes(storedValue)) {
    return storedValue;
  }
  localStorage.setItem(PAGE_SIZE_STORAGE_KEY, DEFAULT_PAGE_SIZE);
  return DEFAULT_PAGE_SIZE;
};

// should take in a players list from a game
export default function ReportTable({
  reports,
  storybook = false,
  buttons = true,
}) {
  const testid = "ReportTable";

  const navigate = useNavigate();

  const [pageSize, setPageSize] = useState(getInitialPageSize);

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    localStorage.setItem(PAGE_SIZE_STORAGE_KEY, newPageSize);
  };

  const reportCallback = (cell) => {
    const route = `/admin/report/${cell.row.values["id"]}`;
    if (storybook) {
      window.alert(`would navigate to ${route}`);
    } else {
      navigate(route);
    }
  };

  const columns = [
    {
      Header: "id",
      accessor: "id",
    },
    {
      Header: "gameId",
      accessor: "gameId",
      Cell: (props) => {
        return <div style={{ textAlign: "right" }}>{props.value}</div>;
      },
    },
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Create Date",
      accessor: "createDate",
    },
    {
      Header: "Num Users",
      accessor: "numUsers",
      Cell: (props) => {
        return <div style={{ textAlign: "right" }}>{props.value}</div>;
      },
    },
    {
      Header: "Num Cows",
      accessor: "numCows",
      Cell: (props) => {
        return <div style={{ textAlign: "right" }}>{props.value}</div>;
      },
    },
  ];

  if (buttons) {
    columns.push(
      ButtonColumn("View Report", "secondary", reportCallback, testid),
    );
  }

  const sortBy = [{ id: "createDate", desc: true }];

  return (
    <>
      <PageSizeSelector
        value={pageSize}
        onChange={handlePageSizeChange}
        options={PAGE_SIZE_OPTIONS}
        testid={`${testid}-page-size-selector`}
      />
      <OurTable
        data={reports}
        columns={columns}
        testid={testid}
        pageSize={pageSize}
        initialState={{ sortBy }}
      />
    </>
  );
}
