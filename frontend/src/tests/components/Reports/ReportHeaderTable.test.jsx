import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import ReportHeaderTable from "main/components/Reports/ReportHeaderTable";
import reportFixtures from "fixtures/reportFixtures";

describe("ReportHeaderTable tests", () => {
  const queryClient = new QueryClient();

  test("Has the expected column headers and content", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportHeaderTable report={reportFixtures.threeReports[1]} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedFields = [
      "cowPrice",
      "milkPrice",
      "startingBalance",
      "startingDate",
      "showLeaderboard",
      "carryingCapacity",
      "degradationRate",
      "belowCapacityHealthUpdateStrategy",
      "aboveCapacityHealthUpdateStrategy",
    ];

    const testId = "ReportHeaderTable";

    // EXPLICIT HEADER CHECKS to kill string literal mutants ("BelowCap", "Capacity", etc.)
    expect(screen.getByTestId(`${testId}-header-cowPrice`)).toHaveTextContent(
      "Cow Price",
    );
    expect(screen.getByTestId(`${testId}-header-milkPrice`)).toHaveTextContent(
      "Milk Price",
    );
    expect(
      screen.getByTestId(`${testId}-header-startingBalance`),
    ).toHaveTextContent("Start Bal");
    expect(
      screen.getByTestId(`${testId}-header-startingDate`),
    ).toHaveTextContent("Start Date");
    expect(
      screen.getByTestId(`${testId}-header-showLeaderboard`),
    ).toHaveTextContent("Leaderboard");
    expect(
      screen.getByTestId(`${testId}-header-carryingCapacity`),
    ).toHaveTextContent("Capacity");
    expect(
      screen.getByTestId(`${testId}-header-degradationRate`),
    ).toHaveTextContent("Degrad Rate");
    expect(
      screen.getByTestId(`${testId}-header-belowCapacityHealthUpdateStrategy`),
    ).toHaveTextContent("BelowCap");
    expect(
      screen.getByTestId(`${testId}-header-aboveCapacityHealthUpdateStrategy`),
    ).toHaveTextContent("AboveCap");

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-cowPrice`),
    ).toHaveTextContent("100");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-milkPrice`),
    ).toHaveTextContent("5");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-startingBalance`),
    ).toHaveTextContent("$10,000.00");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-startingDate`),
    ).toHaveTextContent(/^2023-08-06$/);
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-showLeaderboard`),
    ).toHaveTextContent("true");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-carryingCapacity`),
    ).toHaveTextContent("10");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-degradationRate`),
    ).toHaveTextContent("0.1");
    expect(
      screen.getByTestId(
        `${testId}-cell-row-0-col-belowCapacityHealthUpdateStrategy`,
      ),
    ).toHaveTextContent("Constant");
    expect(
      screen.getByTestId(
        `${testId}-cell-row-0-col-aboveCapacityHealthUpdateStrategy`,
      ),
    ).toHaveTextContent("Linear");
  });

  test("Has all numeric values right-justified", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportHeaderTable report={reportFixtures.threeReports[1]} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const testId = "ReportHeaderTable";

    // Grab the cell, then grab its first child (which is the div with the style)
    const cowPriceDiv = screen.getByTestId(
      `${testId}-cell-row-0-col-cowPrice`,
    ).firstElementChild;
    expect(cowPriceDiv).toHaveStyle("text-align: right");

    const milkPriceDiv = screen.getByTestId(
      `${testId}-cell-row-0-col-milkPrice`,
    ).firstElementChild;
    expect(milkPriceDiv).toHaveStyle("text-align: right");

    const startingBalanceDiv = screen.getByTestId(
      `${testId}-cell-row-0-col-startingBalance`,
    ).firstElementChild;
    expect(startingBalanceDiv).toHaveStyle("text-align: right");

    // EXPLICIT STYLE CHECKS for Capacity and Degrad Rate to kill the newly revealed mutants
    const capacityDiv = screen.getByTestId(
      `${testId}-cell-row-0-col-carryingCapacity`,
    ).firstElementChild;
    expect(capacityDiv).toHaveStyle("text-align: right");

    const degradRateDiv = screen.getByTestId(
      `${testId}-cell-row-0-col-degradationRate`,
    ).firstElementChild;
    expect(degradRateDiv).toHaveStyle("text-align: right");
  });
});
