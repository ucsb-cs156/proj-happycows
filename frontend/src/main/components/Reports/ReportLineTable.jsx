import OurTable from "main/components/OurTable";
import PageSizeSelector from "main/components/Utils/PageSizeSelector";
import usePageSize from "main/utils/usePageSize";
import { formatter } from "./ReportFormatterUtil";

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200, 500];
const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_STORAGE_KEY = "report-line-page-size";

// should take in a players list from a game
export default function ReportLineTable({ reportLines }) {
  const [pageSize, handlePageSizeChange] = usePageSize({
    storageKey: PAGE_SIZE_STORAGE_KEY,
    options: PAGE_SIZE_OPTIONS,
    defaultPageSize: DEFAULT_PAGE_SIZE,
  });

  const columns = [
    {
      Header: "userId",
      accessor: "userId",
    },
    {
      Header: "Username",
      accessor: "username",
    },
    {
      Header: "Total Wealth",
      accessor: "totalWealth",
      Cell: (props) => {
        return (
          <div style={{ textAlign: "right" }}>
            {formatter.format(props.value)}
          </div>
        );
      },
    },
    {
      Header: "Num Cows",
      accessor: "numOfCows",
      Cell: (props) => {
        return <div style={{ textAlign: "right" }}>{props.value}</div>;
      },
    },
    {
      Header: "Avg Cow Health",
      accessor: "avgCowHealth",
      Cell: (props) => {
        return <div style={{ textAlign: "right" }}>{props.value}</div>;
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
    {
      Header: "Create Date",
      accessor: "createDate",
      Cell: (props) => {
        return <div style={{ textAlign: "right" }}>{props.value}</div>;
      },
    },
  ];

  const testid = "ReportLineTable";

  return (
    <>
      <PageSizeSelector
        value={pageSize}
        onChange={handlePageSizeChange}
        options={PAGE_SIZE_OPTIONS}
        testid={`${testid}-page-size-selector`}
      />
      <OurTable
        data={reportLines}
        columns={columns}
        testid={testid}
        pageSize={pageSize}
      />
    </>
  );
}
