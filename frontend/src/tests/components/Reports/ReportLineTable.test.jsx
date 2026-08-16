import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import ReportLineTable from "main/components/Reports/ReportLineTable";
import reportLineFixtures from "fixtures/reportLineFixtures";

describe("ReportLineTable tests", () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    localStorage.clear();
  });

  test("Has the expected column headers and content", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportLineTable reportLines={reportLineFixtures.twoReportLines} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedFields = [
      "userId",
      "username",
      "totalWealth",
      "numOfCows",
      "avgCowHealth",
      "cowsBought",
      "cowsSold",
      "cowDeaths",
      "createDate",
    ];
    const expectedHeaders = [
      "userId",
      "Username",
      "Total Wealth",
      "Num Cows",
      "Avg Cow Health",
      "Cows Bought",
      "Cows Sold",
      "Cow Deaths",
      "Create Date",
    ];

    const testId = "ReportLineTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-userId`),
    ).toHaveTextContent("1");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-username`),
    ).toHaveTextContent("Phill Conrad");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-totalWealth`),
    ).toHaveTextContent("$9,745.00");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-numOfCows`),
    ).toHaveTextContent("3");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-avgCowHealth`),
    ).toHaveTextContent("100");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-cowsBought`),
    ).toHaveTextContent("3");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-cowsSold`),
    ).toHaveTextContent("0");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-cowDeaths`),
    ).toHaveTextContent("0");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-createDate`),
    ).toHaveTextContent("2023-08-07T01:12:54.767+00:00");
  });

  test("Has numeric values right-justified", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportLineTable reportLines={reportLineFixtures.twoReportLines} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const testId = "ReportLineTable";
    const rightJustifiedColumns = [
      "totalWealth",
      "numOfCows",
      "avgCowHealth",
      "cowsBought",
      "cowsSold",
      "cowDeaths",
      "createDate",
    ];

    rightJustifiedColumns.forEach((column) => {
      const cell = screen.getByTestId(`${testId}-cell-row-0-col-${column}`);
      expect(cell.firstChild).toHaveStyle("text-align: right;");
    });
  });

  test("defaults to a page size of 20 when nothing is stored in localStorage", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportLineTable reportLines={reportLineFixtures.twoReportLines} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const selector = screen.getByTestId("ReportLineTable-page-size-selector");
    expect(selector).toHaveValue("20");
    expect(localStorage.getItem("report-line-page-size")).toBe("20");
  });

  test("selecting a page size stores it in localStorage under 'report-line-page-size'", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportLineTable reportLines={reportLineFixtures.twoReportLines} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const selector = screen.getByTestId("ReportLineTable-page-size-selector");
    fireEvent.change(selector, { target: { value: "50" } });

    await waitFor(() => {
      expect(localStorage.getItem("report-line-page-size")).toBe("50");
    });
  });

  test("uses the page size stored in localStorage when it is a valid option", () => {
    localStorage.setItem("report-line-page-size", "100");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportLineTable reportLines={reportLineFixtures.twoReportLines} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const selector = screen.getByTestId("ReportLineTable-page-size-selector");
    expect(selector).toHaveValue("100");
  });

  test("falls back to 20 and updates localStorage when the stored value is not a valid option", () => {
    localStorage.setItem("report-line-page-size", "37");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportLineTable reportLines={reportLineFixtures.twoReportLines} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const selector = screen.getByTestId("ReportLineTable-page-size-selector");
    expect(selector).toHaveValue("20");
    expect(localStorage.getItem("report-line-page-size")).toBe("20");
  });
});
