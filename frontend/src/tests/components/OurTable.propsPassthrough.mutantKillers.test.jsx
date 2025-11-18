import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

// Mock react-table to provide explicit props so OurTable must spread them.
vi.mock("react-table", () => {
  return {
    useSortBy: (fn) => fn,
    useTable: () => ({
      getTableProps: () => ({ "data-table-prop": "table-prop", key: "tkey" }),
      getTableBodyProps: () => ({ "data-body-prop": "body-prop", key: "bkey" }),
      headerGroups: [
        {
          getHeaderGroupProps: () => ({
            "data-hg-prop": "hg-prop",
            key: "hgkey",
          }),
          headers: [
            {
              id: "col1",
              getHeaderProps: () => ({
                "data-col-prop": "col-prop",
                key: "ckey",
              }),
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
          getRowProps: () => ({ "data-row-prop": "row-prop", key: "rkey" }),
          cells: [
            {
              row: { index: 0 },
              column: { id: "col1" },
              getCellProps: () => ({
                "data-cell-prop": "cell-prop",
                key: "pkey",
              }),
              render: () => "C1",
            },
          ],
        },
      ],
      prepareRow: () => {},
    }),
  };
});

import OurTable from "main/components/OurTable";

describe("OurTable spreads props from react-table helpers (kills destructuring mutants)", () => {
  test("spreads table/body/header/column/row/cell props into DOM", () => {
    render(<OurTable columns={[]} data={[]} testid="pt" />);

    // table props applied on wrapping div and Table
    expect(screen.getByRole("table").parentElement).toHaveAttribute(
      "data-table-prop",
      "table-prop",
    );

    // header group props applied on tr
    const thead = document.querySelector("thead");
    const tr = thead?.querySelector("tr");
    expect(tr).toHaveAttribute("data-hg-prop", "hg-prop");

    // column props applied on th
    const th = screen.getByText("H1").closest("th");
    expect(th).toHaveAttribute("data-col-prop", "col-prop");

    // tbody props applied
    const tbody = document.querySelector("tbody");
    expect(tbody).toHaveAttribute("data-body-prop", "body-prop");

    // row props applied on tr
    const rowTr = tbody?.querySelector("tr");
    expect(rowTr).toHaveAttribute("data-row-prop", "row-prop");

    // cell props applied on td
    const td = screen.getByText("C1").closest("td");
    expect(td).toHaveAttribute("data-cell-prop", "cell-prop");
  });
});
