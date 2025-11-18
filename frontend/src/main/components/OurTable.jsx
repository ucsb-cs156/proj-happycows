import React from "react";
import { useTable, useSortBy } from "react-table";
import { Table, Button, Pagination } from "react-bootstrap";
import Plaintext from "main/components/Utils/Plaintext";

// Stryker disable all
var tableStyle = {
  background: "white",
  display: "block",
  maxWidth: "-moz-fit-content",
  margin: "0 auto",
  overflowX: "auto",
  whiteSpace: "nowrap",
};
var paginationStyle = {
  display: "flex",
  justifyContent: "right",
};
// Stryker restore all
export default function OurTable({
  columns,
  data,
  testid = "testid",
  ...rest
}) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const pageSize = rest.pageSize || 10;

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
        ...(rest.initialState && {
          initialState: rest.initialState,
        }),
      },
      useSortBy,
    );

  const tableProps = getTableProps();
  const { key: tableKey, ...tableRest } = tableProps || {};
  const bodyProps = getTableBodyProps();
  const { key: bodyKey, ...bodyRest } = bodyProps || {};

  return (
    <div {...tableRest} key={tableKey}>
      <Table
        style={tableStyle}
        {...tableRest}
        key={tableKey}
        striped
        bordered
        hover
      >
        <thead>
          {headerGroups.map((headerGroup, hgIndex) => {
            const hgProps = headerGroup.getHeaderGroupProps();
            const { key: hgKey, ...hgRest } = hgProps || {};
            const safeHgKey = hgKey ?? `headergroup-${hgIndex}`;
            return (
              <tr {...hgRest} key={safeHgKey} data-fallback-key={safeHgKey}>
                {headerGroup.headers.map((column, colIndex) => {
                  const colProps = column.getHeaderProps(
                    column.getSortByToggleProps(),
                  );
                  const { key: colKey, ...colRest } = colProps || {};
                  const safeColKey = colKey ?? `col-${column.id ?? colIndex}`;
                  return (
                    <th
                      {...colRest}
                      key={safeColKey}
                      data-fallback-key={safeColKey}
                      data-testid={`${testid}-header-${column.id}`}
                    >
                      {column.render("Header")}
                      <span
                        data-testid={`${testid}-header-${column.id}-sort-carets`}
                      >
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " 🔽"
                            : " 🔼"
                          : ""}
                      </span>
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody {...bodyRest} key={bodyKey}>
          {rows
            .slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
            .map((row, rowIndex) => {
              prepareRow(row);
              const rowProps = row.getRowProps();
              const { key: rowKey, ...rowRest } = rowProps || {};
              const safeRowKey = rowKey ?? `row-${rowIndex}`;
              return (
                <tr
                  {...rowRest}
                  key={safeRowKey}
                  data-fallback-key={safeRowKey}
                >
                  {row.cells.map((cell, cellIndex) => {
                    const cellProps = cell.getCellProps();
                    const { key: cellKey, ...cellRest } = cellProps || {};
                    const safeCellKey =
                      cellKey ??
                      `cell-${cell.row.index}-${cell.column.id ?? cellIndex}`;
                    return (
                      <td
                        {...cellRest}
                        key={safeCellKey}
                        data-fallback-key={safeCellKey}
                        data-testid={`${testid}-cell-row-${cell.row.index}-col-${cell.column.id}`}
                      >
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
        </tbody>
      </Table>
      {rows.length > pageSize && (
        <div style={paginationStyle}>
          <Pagination {...tableRest}>
            <Pagination.Prev
              onClick={() => setPageIndex(pageIndex - 1)}
              data-testid={`${testid}-prev-page-button`}
              disabled={pageIndex === 0}
            />
            {pageIndex > 3 && (
              <Pagination.Item
                onClick={() => setPageIndex(0)}
                data-testid={`${testid}-first-page-button`}
              >
                {1}
              </Pagination.Item>
            )}
            {pageIndex > 4 && (
              <Pagination.Ellipsis data-testid={`${testid}-left-ellipsis`} />
            )}
            {pageIndex === 4 && (
              <Pagination.Item
                onClick={() => setPageIndex(pageIndex - 3)}
                data-testid={`${testid}-back-three-page-button`}
              >
                {pageIndex - 2}
              </Pagination.Item>
            )}
            {pageIndex > 1 && (
              <Pagination.Item
                onClick={() => setPageIndex(pageIndex - 2)}
                data-testid={`${testid}-back-two-page-button`}
              >
                {pageIndex - 1}
              </Pagination.Item>
            )}
            {pageIndex > 0 && (
              <Pagination.Item
                onClick={() => setPageIndex(pageIndex - 1)}
                data-testid={`${testid}-back-one-page-button`}
              >
                {pageIndex}
              </Pagination.Item>
            )}
            <Pagination.Item
              data-testid={`${testid}-current-page-button`}
              // Stryker disable all
              active={true}
              // Stryker restore all
            >
              {pageIndex + 1}
            </Pagination.Item>
            {pageIndex + 1 <= Math.ceil(rows.length / pageSize - 1) && (
              <Pagination.Item
                onClick={() => setPageIndex(pageIndex + 1)}
                data-testid={`${testid}-forward-one-page-button`}
              >
                {pageIndex + 2}
              </Pagination.Item>
            )}
            {pageIndex + 2 <= Math.ceil(rows.length / pageSize - 1) && (
              <Pagination.Item
                onClick={() => setPageIndex(pageIndex + 2)}
                data-testid={`${testid}-forward-two-page-button`}
              >
                {pageIndex + 3}
              </Pagination.Item>
            )}
            {pageIndex + 4 === Math.ceil(rows.length / pageSize - 1) && (
              <Pagination.Item
                onClick={() => setPageIndex(pageIndex + 3)}
                data-testid={`${testid}-forward-three-page-button`}
              >
                {pageIndex + 4}
              </Pagination.Item>
            )}
            {pageIndex + 4 < Math.ceil(rows.length / pageSize - 1) && (
              <Pagination.Ellipsis data-testid={`${testid}-right-ellipsis`} />
            )}
            {pageIndex + 4 <= Math.ceil(rows.length / pageSize - 1) && (
              <Pagination.Item
                onClick={() =>
                  setPageIndex(Math.ceil(rows.length / pageSize - 1))
                }
                data-testid={`${testid}-last-page-button`}
              >
                {Math.ceil(rows.length / pageSize)}
              </Pagination.Item>
            )}
            <Pagination.Next
              {...bodyRest}
              onClick={() => setPageIndex(pageIndex + 1)}
              data-testid={`${testid}-next-page-button`}
              disabled={
                pageIndex === Math.ceil(rows.length / pageSize - 1) ||
                rows.length === 0
              }
            />
          </Pagination>
        </div>
      )}
    </div>
  );
}

// The callback function for ButtonColumn should have the form
// (cell) => { doSomethingWith(cell); }
// The fields in cell are:
//   ["column","row","value","getCellProps","render"]
// Documented here: https://react-table.tanstack.com/docs/api/useTable#cell-properties
// Typically, you want cell.row.values, which is where you can get the individual
//   fields of the object representing the row in the table.
// Example:
//   const deleteCallback = (cell) =>
//      toast(`Delete Callback called on id: ${cell.row.values.id} name: ${cell.row.values.name}`);

// Add it to table like this:
// const columns = [
//   {
//       Header: 'id',
//       accessor: 'id', // accessor is the "key" in the data
//   },
//   {
//       Header: 'Name',
//       accessor: 'name',
//   },
//   ButtonColumn("Edit", "primary", editCallback),
//   ButtonColumn("Delete", "danger", deleteCallback)
// ];

export function ButtonColumn(label, variant, callback, testid) {
  const column = {
    Header: label,
    id: label,
    Cell: ({ cell }) => (
      <Button
        variant={variant}
        onClick={() => callback(cell)}
        data-testid={`${testid}-cell-row-${cell.row.index}-col-${cell.column.id}-button`}
      >
        {label}
      </Button>
    ),
  };
  return column;
}

export function HrefButtonColumn(label, variant, href, testid) {
  const column = {
    Header: label,
    id: label,
    Cell: ({ cell }) => (
      <Button
        variant={variant}
        href={`${href}${cell.row.values["commons.id"]}`}
        data-testid={`${testid}-cell-row-${cell.row.index}-col-${cell.column.id}-button`}
      >
        {label}
      </Button>
    ),
  };
  return column;
}

export function PlaintextColumn(label, getText) {
  const column = {
    Header: label,
    id: label,
    Cell: ({ cell }) => <Plaintext text={getText(cell)} />,
  };
  return column;
}

export function DateColumn(label, getDate) {
  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    timeZone: "America/Los_Angeles",
  };
  const column = {
    Header: label,
    id: label,
    Cell: ({ cell }) => {
      const date = new Date(getDate(cell));
      const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
        date,
      );
      return <>{formattedDate}</>;
    },
  };
  return column;
}
