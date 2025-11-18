import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, vi, expect } from "vitest";

// Mock react-table to force missing "key" and "id" so OurTable uses fallback keys (?? branches)
vi.mock("react-table", () => {
  return {
    useSortBy: (fn) => fn, // passthrough
    useTable: () => ({
      // Return null to trigger `tableProps || {}` and `bodyProps || {}` branches
      getTableProps: () => null,
      getTableBodyProps: () => null,
      headerGroups: [
        {
          // return null props to trigger `hgProps || {}` fallback branch
          getHeaderGroupProps: () => null,
          headers: [
            {
              id: undefined, // triggers column id fallback
              // return null props to trigger `colProps || {}` fallback branch
              getHeaderProps: () => null,
              getSortByToggleProps: () => ({}),
              render: () => "H1",
              isSorted: false,
            },
          ],
        },
      ],
      rows: [
        {
          index: 0,
          // return null props to trigger `rowProps || {}` fallback branch
          getRowProps: () => null,
          cells: [
            {
              row: { index: 0 },
              column: { id: undefined }, // triggers cell column.id fallback
              // return null props to trigger `cellProps || {}` fallback branch
              getCellProps: () => null,
              render: () => "C1",
            },
          ],
        },
      ],
      prepareRow: () => {},
    }),
  };
});

// Import after the mock so OurTable uses the mocked hooks
import OurTable from "main/components/OurTable";

describe("OurTable fallback key branches", () => {
  test("renders using fallback keys for header/column/row/cell", () => {
    render(<OurTable columns={[]} data={[]} testid="kf" />);

    // Header and a cell should render using our mocked data
    expect(screen.getByText("H1")).toBeInTheDocument();
    expect(screen.getByText("C1")).toBeInTheDocument();
  });
});
