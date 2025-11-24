import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { vi } from "vitest";
import OurTable, {
  ButtonColumn,
  DateColumn,
  PlaintextColumn,
} from "main/components/OurTable";
describe("OurTable tests", () => {
  const threeRows = [
    {
      col1: "Hello",
      col2: "World",
      createdAt: "2021-04-01T04:00:00.000",
      log: "foo\nbar\n  baz",
    },
    {
      col1: "react-table",
      col2: "rocks",
      createdAt: "2022-01-04T14:00:00.000",
      log: "foo\nbar",
    },
    {
      col1: "whatever",
      col2: "you want",
      createdAt: "2023-04-01T23:00:00.000",
      log: "bar\n  baz",
    },
  ];

  const tenRows = [];
  for (let i = 1; i <= 10; i++) {
    tenRows.push({
      col1: `Hello ${i}`,
      col2: `World ${i}`,
      createdAt: `2021-04-01T04:00:00.000`,
      log: `foo\nbar\n  baz ${i}`,
    });
  }
  const elevenRows = [];
  for (let i = 1; i <= 11; i++) {
    elevenRows.push({
      col1: `Hello ${i}`,
      col2: `World ${i}`,
      createdAt: `2021-04-01T04:00:00.000`,
      log: `foo\nbar\n  baz ${i}`,
    });
  }

  const fortyOneRows = [];
  for (let i = 1; i <= 41; i++) {
    fortyOneRows.push({
      col1: `Hello ${i}`,
      col2: `World ${i}`,
      createdAt: `2021-04-01T04:00:00.000`,
      log: `foo\nbar\n  baz ${i}`,
    });
  }

  const fiftyOneRows = [];
  for (let i = 1; i <= 51; i++) {
    fiftyOneRows.push({
      col1: `Hello ${i}`,
      col2: `World ${i}`,
      createdAt: `2021-04-01T04:00:00.000`,
      log: `foo\nbar\n  baz ${i}`,
    });
  }

  const clickMeCallback = vi.fn();

  const columns = [
    {
      Header: "Column 1",
      accessor: "col1", // accessor is the "key" in the data
    },
    {
      Header: "Column 2",
      accessor: "col2",
    },
    ButtonColumn("Click", "primary", clickMeCallback, "testId"),
    DateColumn("Date", (cell) => cell.row.original.createdAt),
    PlaintextColumn("Log", (cell) => cell.row.original.log),
  ];

  test("button appears in the table and triggers callback on click", async () => {
    render(<OurTable columns={columns} data={threeRows} />);

    expect(
      await screen.findByTestId("testId-cell-row-0-col-Click-button"),
    ).toBeInTheDocument();
    const button = screen.getByTestId("testId-cell-row-0-col-Click-button");
    fireEvent.click(button);
    await waitFor(() => expect(clickMeCallback).toBeCalledTimes(1));
  });

  test("default testid is testId", async () => {
    render(<OurTable columns={columns} data={threeRows} />);
    expect(await screen.findByTestId("testid-header-col1")).toBeInTheDocument();
  });

  test("click on a header and a sort caret should appear", async () => {
    render(
      <OurTable columns={columns} data={threeRows} testid={"sampleTestId"} />,
    );

    expect(
      await screen.findByTestId("sampleTestId-header-col1"),
    ).toBeInTheDocument();
    const col1Header = screen.getByTestId("sampleTestId-header-col1");

    const col1SortCarets = screen.getByTestId(
      "sampleTestId-header-col1-sort-carets",
    );
    expect(col1SortCarets).toHaveTextContent("");

    const col1Row0 = screen.getByTestId("sampleTestId-cell-row-0-col-col1");
    expect(col1Row0).toHaveTextContent("Hello");

    fireEvent.click(col1Header);
    expect(await screen.findByText("🔼")).toBeInTheDocument();

    fireEvent.click(col1Header);
    expect(await screen.findByText("🔽")).toBeInTheDocument();
  });

  test("pagination isn't visible when there is no data", async () => {
    render(<OurTable columns={columns} data={[]} />);
    expect(screen.queryByTestId("testid-prev-page-button")).toBe(null);
    expect(screen.queryByTestId("testid-next-page-button")).toBe(null);
    expect(screen.queryByTestId("testid-current-page-button")).toBe(null);
  });

  test("renders a table with 3 rows and tests that pagination isn't visible when there are less rows than rows per page", async () => {
    render(<OurTable columns={columns} data={threeRows} />);

    expect(screen.queryByTestId("testid-prev-page-button")).toBe(null);
    expect(screen.queryByTestId("testid-next-page-button")).toBe(null);
    expect(screen.queryByTestId("testid-current-page-button")).toBe(null);
  });

  test("renders a table with 10 rows and tests that pagination isn't visible when there are exactly as many rows as rows per page", async () => {
    render(<OurTable columns={columns} data={tenRows} />);

    expect(screen.queryByTestId("testid-prev-page-button")).toBe(null);
    expect(screen.queryByTestId("testid-next-page-button")).toBe(null);
    expect(screen.queryByTestId("testid-current-page-button")).toBe(null);
  });

  test("renders a table with 11 rows and tests that pagination is visible when there are more rows than rows per page", async () => {
    render(<OurTable columns={columns} data={elevenRows} />);

    expect(
      await screen.findByTestId("testid-prev-page-button"),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("testid-next-page-button"),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("testid-current-page-button"),
    ).toBeInTheDocument();
  });

  test("renders a table with 11 rows and clicks on the next page button and previous page button", async () => {
    render(<OurTable columns={columns} data={elevenRows} />);

    expect(
      await screen.findByTestId("testid-next-page-button"),
    ).toBeInTheDocument();
    const item = screen
      .getAllByRole("listitem")
      .filter((item) => within(item).queryByText("Previous"))[0];
    expect(item).toHaveClass("disabled");
    const nextButtonItem = screen
      .getAllByRole("listitem")
      .filter((item) => within(item).queryByText("Next"))[0];
    expect(nextButtonItem).not.toHaveClass("disabled");
    const nextButton = screen.getByTestId("testid-next-page-button");
    expect(await screen.findByText(`Hello 10`)).toBeInTheDocument();
    expect(screen.queryByText(`Hello 11`)).not.toBeInTheDocument();
    expect(
      await screen.findByTestId("testid-current-page-button"),
    ).toContainHTML("1");
    fireEvent.click(nextButton);
    expect(
      await screen.findByTestId("testid-current-page-button"),
    ).toContainHTML("2");
    const newPrevious = screen
      .getAllByRole("listitem")
      .filter((item) => within(item).queryByText("Previous"))[0];
    expect(newPrevious).not.toHaveClass("disabled");
    const newNext = screen
      .getAllByRole("listitem")
      .filter((item) => within(item).queryByText("Next"))[0];
    expect(newNext).toHaveClass("disabled");
    expect(await screen.findByText(`Hello 11`)).toBeInTheDocument();
    const prevButton = screen.getByTestId("testid-prev-page-button");
    fireEvent.click(prevButton);
    expect(await screen.findByText(`Hello 1`)).toBeInTheDocument();
  });

  test("renders a table with 51 rows and tests the first page", async () => {
    render(<OurTable columns={columns} data={fiftyOneRows} />);
    expect(
      await screen.findByTestId("testid-next-page-button"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("testid-left-ellipsis")).toBe(null);
    expect(screen.queryByTestId("testid-back-three-page-button")).toBe(null);
    expect(screen.queryByTestId("testid-back-two-page-button")).toBe(null);
    expect(screen.queryByTestId("testid-back-one-page-button")).toBe(null);
    expect(
      await screen.findByTestId("testid-current-page-button"),
    ).toContainHTML("1");
    expect(
      await screen.findByTestId("testid-forward-one-page-button"),
    ).toContainHTML("2");
    expect(
      await screen.findByTestId("testid-forward-two-page-button"),
    ).toContainHTML("3");
    expect(screen.queryByTestId("testid-forward-three-page-button")).toBe(null);
    expect(
      await screen.findByTestId("testid-right-ellipsis"),
    ).toBeInTheDocument();
    expect(await screen.findByTestId("testid-last-page-button")).toContainHTML(
      "6",
    );
    expect(await screen.findByText(`Hello 10`)).toBeInTheDocument();
  });

  test("renders a table with 51 rows and tests moving forward and back one page", async () => {
    render(<OurTable columns={columns} data={fiftyOneRows} />);

    expect(
      await screen.findByTestId("testid-forward-one-page-button"),
    ).toBeInTheDocument();
    const item = screen
      .getAllByRole("listitem")
      .filter((item) => within(item).queryByText("Previous"))[0];
    expect(item).toHaveClass("disabled");
    const nextButtonItem = screen
      .getAllByRole("listitem")
      .filter((item) => within(item).queryByText("Next"))[0];
    expect(nextButtonItem).not.toHaveClass("disabled");
    const forwardOneButton = screen.getByTestId(
      "testid-forward-one-page-button",
    );
    fireEvent.click(forwardOneButton);
    expect(
      await screen.findByTestId("testid-current-page-button"),
    ).toContainHTML("2");
    expect(
      await screen.findByTestId("testid-forward-one-page-button"),
    ).toContainHTML("3");
    expect(
      await screen.findByTestId("testid-forward-one-page-button"),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("testid-back-one-page-button"),
    ).toContainHTML("1");
    const backOneButton = screen.getByTestId("testid-back-one-page-button");
    fireEvent.click(backOneButton);
    expect(
      await screen.findByTestId("testid-current-page-button"),
    ).toContainHTML("1");
    expect(
      await screen.findByTestId("testid-forward-one-page-button"),
    ).toContainHTML("2");
    const lastButton = screen.getByTestId("testid-last-page-button");
    fireEvent.click(lastButton);
    const newPrevious = screen
      .getAllByRole("listitem")
      .filter((item) => within(item).queryByText("Previous"))[0];
    expect(newPrevious).not.toHaveClass("disabled");
    const newNext = screen
      .getAllByRole("listitem")
      .filter((item) => within(item).queryByText("Next"))[0];
    expect(newNext).toHaveClass("disabled");
    expect(
      await screen.findByTestId("testid-current-page-button"),
    ).toContainHTML("6");
    expect(await screen.findByText(`Hello 51`)).toBeInTheDocument();
    expect(screen.queryByText(`Hello 11`)).not.toBeInTheDocument();
    expect(
      await screen.findByTestId("testid-back-one-page-button"),
    ).toContainHTML("5");
  });

  test("renders a table with 51 rows and tests the first and last page buttons", async () => {
    render(<OurTable columns={columns} data={fiftyOneRows} />);

    expect(
      await screen.findByTestId("testid-next-page-button"),
    ).toBeInTheDocument();
    const item = screen
      .getAllByRole("listitem")
      .filter((item) => within(item).queryByText("Previous"))[0];
    expect(item).toHaveClass("disabled");
    const nextButtonItem = screen
      .getAllByRole("listitem")
      .filter((item) => within(item).queryByText("Next"))[0];
    expect(nextButtonItem).not.toHaveClass("disabled");
    const lastButton = screen.getByTestId("testid-last-page-button");
    const rightEllipsis = screen.getByTestId("testid-right-ellipsis");
    fireEvent.click(lastButton);
    expect(
      await screen.findByTestId("testid-current-page-button"),
    ).toContainHTML("6");
    expect(await screen.findByText(`Hello 51`)).toBeInTheDocument();
    expect(rightEllipsis).not.toBeInTheDocument();
    expect(lastButton).not.toBeInTheDocument();
    expect(
      await screen.findByTestId("testid-left-ellipsis"),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("testid-back-two-page-button"),
    ).toContainHTML("4");
    expect(
      await screen.findByTestId("testid-back-one-page-button"),
    ).toContainHTML("5");
    expect(await screen.findByTestId("testid-first-page-button")).toContainHTML(
      "1",
    );
    const firstButton = screen.getByTestId("testid-first-page-button");
    fireEvent.click(firstButton);
    expect(firstButton).not.toBeInTheDocument();
  });

  test("renders a table with 51 rows and moving forward and back two pages", async () => {
    render(<OurTable columns={columns} data={fiftyOneRows} />);

    expect(
      await screen.findByTestId("testid-next-page-button"),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("testid-forward-two-page-button"),
    ).toContainHTML("3");
    const forwardTwoButton = screen.getByTestId(
      "testid-forward-two-page-button",
    );
    fireEvent.click(forwardTwoButton);
    expect(
      await screen.findByTestId("testid-current-page-button"),
    ).toContainHTML("3");
    const backTwoButton = screen.getByTestId("testid-back-two-page-button");
    fireEvent.click(backTwoButton);
    expect(await screen.findByTestId("testid-last-page-button")).toContainHTML(
      "6",
    );
    expect(screen.queryByTestId("testid-back-two-page-button")).toBe(null);
    const lastButton = screen.getByTestId("testid-last-page-button");
    fireEvent.click(lastButton);
    expect(
      await screen.findByTestId("testid-current-page-button"),
    ).toContainHTML("6");
    expect(screen.queryByTestId("testid-forward-two-page-button")).toBe(null);
    expect(
      await screen.findByTestId("testid-back-one-page-button"),
    ).toContainHTML("5");
    const backOneButton = screen.getByTestId("testid-back-one-page-button");
    fireEvent.click(backOneButton);
    expect(
      await screen.findByTestId("testid-current-page-button"),
    ).toContainHTML("5");
    expect(screen.queryByTestId("testid-left-ellipsis")).toBe(null);
    expect(screen.queryByTestId("testid-forward-two-page-button")).toBe(null);
    fireEvent.click(backOneButton);
    expect(
      await screen.findByTestId("testid-current-page-button"),
    ).toContainHTML("4");
    expect(
      await screen.findByTestId("testid-forward-two-page-button"),
    ).toContainHTML("6");
    fireEvent.click(await screen.findByTestId("testid-back-two-page-button"));
    expect(
      await screen.findByTestId("testid-current-page-button"),
    ).toContainHTML("2");
    expect(screen.queryByTestId("testid-back-two-page-button")).toBe(null);
    fireEvent.click(await screen.findByTestId("testid-next-page-button"));
    expect(
      await screen.findByTestId("testid-back-two-page-button"),
    ).toContainHTML("1");
  });

  test("renders a table with 41 rows and moving forward and back three pages", async () => {
    render(<OurTable columns={columns} data={fortyOneRows} />);

    expect(screen.queryByTestId("testid-back-three-page-button")).toBe(null);
    const forwardThreeButton = screen.getByTestId(
      "testid-forward-three-page-button",
    );
    fireEvent.click(forwardThreeButton);
    expect(
      await screen.findByTestId("testid-current-page-button"),
    ).toContainHTML("4");
    expect(screen.queryByTestId("testid-forward-three-page-button")).toBe(null);
    expect(screen.queryByTestId("testid-first-page-button")).toBe(null);
    fireEvent.click(screen.getByTestId("testid-forward-one-page-button"));
    expect(
      await screen.findByTestId("testid-back-three-page-button"),
    ).toContainHTML("2");
    const backThreeButton = screen.getByTestId("testid-back-three-page-button");
    fireEvent.click(backThreeButton);
    expect(
      await screen.findByTestId("testid-current-page-button"),
    ).toContainHTML("2");
    expect(screen.queryByTestId("testid-back-three-page-button")).toBe(null);
    const forwardOneButton = screen.getByTestId(
      "testid-forward-one-page-button",
    );
    fireEvent.click(forwardOneButton);
    expect(
      await screen.findByTestId("testid-current-page-button"),
    ).toContainHTML("3");
    expect(screen.queryByTestId("testid-forward-three-page-button")).toBe(null);
    expect(screen.queryByTestId("testid-back-three-page-button")).toBe(null);
    fireEvent.click(forwardOneButton);
    expect(
      await screen.findByTestId("testid-current-page-button"),
    ).toContainHTML("4");
    expect(screen.queryByTestId("testid-forward-three-page-button")).toBe(null);
    expect(screen.queryByTestId("testid-back-three-page-button")).toBe(null);
  });
});

describe("OurTable extra coverage", () => {
  test("HrefButtonColumn renders a button with href using commons.id", async () => {
    // Test HrefButtonColumn in isolation (no react-table mock)
    const mod = await import("main/components/OurTable");
    const { HrefButtonColumn } = mod;

    const column = HrefButtonColumn("Link", "primary", "/foo/", "tid");

    function Wrapper() {
      const cell = {
        row: { index: 0, values: { "commons.id": 42 } },
        column: { id: column.id },
      };
      return column.Cell({ cell });
    }

    render(<Wrapper />);

    const btn = await screen.findByTestId("tid-cell-row-0-col-Link-button");
    expect(btn).toBeInTheDocument();
    const href =
      btn.getAttribute("href") ?? btn.closest("a")?.getAttribute("href");
    expect(href).toBe("/foo/42");
  });

  test("renders fallback data-fallback-key attributes when props lack keys", async () => {
    // Ensure module registry is reset so the mocked module is used on import
    vi.resetModules();
    await vi.doMock("react-table", () => {
      return {
        useTable: (options) => {
          const columns = options.columns || [];
          const data = options.data || [];

          const headerGroups = [
            {
              getHeaderGroupProps: () => ({}),
              headers: columns.map((col, idx) => ({
                getHeaderProps: () => ({}),
                getSortByToggleProps: () => ({}),
                render: () => col.Header ?? col.header ?? `col-${idx}`,
                id: col.id ?? col.accessor ?? `col-${idx}`,
                isSorted: false,
                isSortedDesc: false,
              })),
            },
          ];

          const rows = data.map((d, i) => ({
            getRowProps: () => ({}),
            index: i,
            cells: columns.map((col, ci) => ({
              getCellProps: () => ({}),
              render: () => {
                if (col.Cell) {
                  return col.Cell({
                    cell: {
                      row: { index: i, values: d },
                      column: { id: col.id ?? col.accessor ?? ci },
                    },
                  });
                }
                return d[col.accessor];
              },
              row: { index: i, values: d },
              column: { id: col.id ?? col.accessor ?? ci },
            })),
          }));

          return {
            getTableProps: () => ({}),
            getTableBodyProps: () => ({}),
            headerGroups,
            rows,
            prepareRow: () => {},
          };
        },
        useSortBy: () => {},
      };
    });

    const mod = await import("main/components/OurTable");
    const OurTableLocal = mod.default;

    const columns = [
      { Header: "Col1", accessor: "col1", id: "col1" },
      { Header: "Col2", accessor: "col2", id: "col2" },
    ];
    const data = [{ col1: "A", col2: "B" }];

    render(<OurTableLocal columns={columns} data={data} testid={"testid"} />);
    const headerCell = await screen.findByTestId("testid-header-col1");
    expect(headerCell).toBeInTheDocument();
    const headerRow = headerCell.closest("tr");
    // exact fallback key should be headergroup-0 when no key provided
    expect(headerRow).toHaveAttribute("data-fallback-key", "headergroup-0");

    const bodyCell = await screen.findByTestId("testid-cell-row-0-col-col1");
    expect(bodyCell).toBeInTheDocument();
    // exact fallback key should include the column id when present
    // for these columns the expected key is `cell-0-col1`
    expect(bodyCell).toHaveAttribute("data-fallback-key", "cell-0-col1");
    const tr = bodyCell.closest("tr");
    expect(tr).toHaveAttribute("data-fallback-key", "row-0");
  });

  test("renders fallback branches when react-table props are undefined", async () => {
    // Mock react-table to return undefined props to exercise || {} and ?? fallbacks
    // Ensure module registry is reset so the mocked module is used on import
    vi.resetModules();
    await vi.doMock("react-table", () => {
      return {
        useTable: (options) => {
          const columns = options.columns || [];
          const data = options.data || [];

          const headerGroups = [
            {
              // getHeaderGroupProps returns undefined to trigger hgProps || {}
              getHeaderGroupProps: () => undefined,
              headers: columns.map((col, idx) => ({
                // header-level getHeaderProps returns undefined to trigger colProps || {}
                getHeaderProps: () => undefined,
                getSortByToggleProps: () => undefined,
                render: () => col.Header ?? col.header ?? `col-${idx}`,
                // no id to trigger safeColKey fallback
                id: col.id ?? col.accessor ?? undefined,
                isSorted: false,
                isSortedDesc: false,
              })),
            },
          ];

          const rows = data.map((d, i) => ({
            // getRowProps undefined to trigger rowProps || {}
            getRowProps: () => undefined,
            index: i,
            cells: columns.map((col, ci) => ({
              // getCellProps undefined to trigger cellProps || {}
              getCellProps: () => undefined,
              render: () => d[col.accessor] ?? null,
              row: { index: i, values: d },
              column: { id: col.id ?? col.accessor ?? ci },
            })),
          }));

          return {
            getTableProps: () => undefined,
            getTableBodyProps: () => undefined,
            headerGroups,
            rows,
            prepareRow: () => {},
          };
        },
        useSortBy: () => {},
      };
    });

    const mod = await import("main/components/OurTable");
    const OurTableLocal = mod.default;

    const columns = [
      { Header: "Col1", accessor: "col1" },
      { Header: "Col2", accessor: "col2" },
    ];
    const data = [{ col1: "A", col2: "B" }];

    render(<OurTableLocal columns={columns} data={data} testid={"tf"} />);

    const headerCell = await screen.findByTestId("tf-header-col1");
    expect(headerCell).toBeInTheDocument();
    const headerRow = headerCell.closest("tr");
    expect(headerRow).toHaveAttribute("data-fallback-key", "headergroup-0");

    const bodyCell = await screen.findByTestId("tf-cell-row-0-col-col1");
    expect(bodyCell).toBeInTheDocument();
    // accessor exists so fallback uses accessor as the column id
    expect(bodyCell).toHaveAttribute("data-fallback-key", "cell-0-col1");
    const tr = bodyCell.closest("tr");
    expect(tr).toHaveAttribute("data-fallback-key", "row-0");
  });

  test("renders when react-table props provide explicit keys", async () => {
    // Reset module registry and mock react-table so OurTable is re-imported
    // with the mocked hook implementations. This ensures the mocked
    // `useTable` is used during module initialization.
    vi.resetModules();
    // Mock react-table to return props with explicit key fields to exercise
    // the branches where the component uses the provided keys instead of fallbacks
    await vi.doMock("react-table", () => {
      return {
        useTable: (options) => {
          const columns = options.columns || [];
          const data = options.data || [];

          const headerGroups = [
            {
              getHeaderGroupProps: () => ({ key: "HG-0" }),
              headers: columns.map((col, idx) => ({
                getHeaderProps: () => ({ key: `COL-${idx}` }),
                getSortByToggleProps: () => ({}),
                render: () => col.Header ?? col.header ?? `col-${idx}`,
                id: col.id ?? col.accessor ?? `col-${idx}`,
                isSorted: false,
                isSortedDesc: false,
              })),
            },
          ];

          const rows = data.map((d, i) => ({
            getRowProps: () => ({ key: `ROW-${i}` }),
            index: i,
            cells: columns.map((col, ci) => ({
              getCellProps: () => ({ key: `CELL-${i}-${ci}` }),
              render: () => d[col.accessor] ?? null,
              row: { index: i, values: d },
              column: { id: col.id ?? col.accessor ?? ci },
            })),
          }));

          return {
            getTableProps: () => ({ key: "TABLE-KEY", "data-hello": "x" }),
            // include a renderable data attribute so we can assert that
            // the spread of bodyRest actually applies DOM attributes to tbody
            getTableBodyProps: () => ({ key: "BODY-KEY", "data-body": "B" }),
            headerGroups,
            rows,
            prepareRow: () => {},
          };
        },
        useSortBy: () => {},
      };
    });

    const mod = await import("main/components/OurTable");
    const OurTableLocal = mod.default;

    const columns = [{ Header: "Col1", accessor: "col1", id: "col1" }];
    const data = [{ col1: "A" }];

    render(<OurTableLocal columns={columns} data={data} testid={"tk"} />);

    const headerCell = await screen.findByTestId("tk-header-col1");
    expect(headerCell).toBeInTheDocument();
    const headerRow = headerCell.closest("tr");
    const hf = headerRow.getAttribute("data-fallback-key");
    // the explicit key provided by the mocked getHeaderGroupProps should be used
    expect(hf).toBe("HG-0");

    const bodyCell = await screen.findByTestId("tk-cell-row-0-col-col1");
    expect(bodyCell).toBeInTheDocument();
    const bf = bodyCell.getAttribute("data-fallback-key");
    expect(bf).toBe("CELL-0-0");

    const table = headerCell.closest("table");
    expect(table).toHaveAttribute("data-hello", "x");
    // tbody should receive data attributes from getTableBodyProps spread
    const tbody = table.querySelector("tbody");
    expect(tbody).toHaveAttribute("data-body", "B");
  });

  test("covers column.id ?? colIndex and cell.column.id ?? cellIndex fallbacks", async () => {
    // Reset modules so the mock takes effect on import
    vi.resetModules();
    await vi.doMock("react-table", () => {
      return {
        useTable: (options) => {
          const columns = options.columns || [];
          const data = options.data || [];

          const headerGroups = [
            {
              getHeaderGroupProps: () => undefined,
              headers: columns.map((col, idx) => ({
                // explicitly omit id and accessor to force fallback to index
                getHeaderProps: () => undefined,
                getSortByToggleProps: () => undefined,
                render: () => col.Header ?? `col-${idx}`,
                id: undefined,
                isSorted: false,
                isSortedDesc: false,
              })),
            },
          ];

          const rows = data.map((d, i) => ({
            getRowProps: () => undefined,
            index: i,
            cells: columns.map((col, _ci) => ({
              getCellProps: () => undefined,
              render: () => d[col.accessor] ?? null,
              row: { index: i, values: d },
              column: { id: undefined },
            })),
          }));

          return {
            getTableProps: () => undefined,
            getTableBodyProps: () => undefined,
            headerGroups,
            rows,
            prepareRow: () => {},
          };
        },
        useSortBy: () => {},
      };
    });

    const mod = await import("main/components/OurTable");
    const OurTableLocal = mod.default;

    const columns = [{ Header: "C1" }, { Header: "C2" }];
    const data = [{}, {}];

    render(<OurTableLocal columns={columns} data={data} testid={"cf"} />);

    // The component uses column.id for the data-testid; when id is undefined
    // the rendered testid will include "undefined". Find the header by its
    // displayed text and assert that the fallback keys were used for the
    // DOM keys (which exercise the column.index / cell.index fallbacks).
    const headerText = await screen.findByText("C1");
    const headerCell = headerText.closest("th");
    expect(headerCell).toBeInTheDocument();
    // header should have been assigned the safe fallback key `col-0`
    expect(headerCell).toHaveAttribute("data-fallback-key", "col-0");

    // The cell's data-testid includes the literal `undefined` for the
    // missing column.id; assert the cell exists and has the safe fallback key
    const bodyCells = await screen.findAllByTestId(
      "cf-cell-row-0-col-undefined",
    );
    expect(bodyCells.length).toBeGreaterThan(0);
    const bodyCell = bodyCells[0];
    expect(bodyCell).toHaveAttribute("data-fallback-key", "cell-0-0");
    const tr = bodyCell.closest("tr");
    expect(tr).toHaveAttribute("data-fallback-key", "row-0");
  });

  test("real rendering uses default safe keys for headergroup/row/cell", async () => {
    // Render without mocking react-table to exercise the real default behavior
    const cols = [{ Header: "C1" }, { Header: "C2" }];
    const rows = [{}];
    render(<OurTable columns={cols} data={rows} testid={"rt"} />);
    // The real renderer creates testids from header text (C1/C2) and
    // uses a different fallback key format than some mocked forms.
    const header = await screen.findByTestId("rt-header-C1");
    expect(header).toBeInTheDocument();
    const headerRow = header.closest("tr");
    // actual fallback key uses camelCase + underscore in real render
    expect(headerRow).toHaveAttribute("data-fallback-key", "headerGroup_0");

    const row = await screen.findByTestId("rt-cell-row-0-col-C1");
    expect(row).toBeInTheDocument();
    const tr = row.closest("tr");
    expect(tr).toHaveAttribute("data-fallback-key", "row_0");
    expect(row).toHaveAttribute("data-fallback-key", "cell_0_C1");
  });

  test("real rendering with explicit column id uses that id in testids and safe keys", async () => {
    const cols = [{ Header: "C1", accessor: "a", id: "myid" }];
    const rows = [{ a: "ValueA" }];
    render(<OurTable columns={cols} data={rows} testid={"rid"} />);

    const header = await screen.findByTestId("rid-header-myid");
    expect(header).toBeInTheDocument();
    const headerRow = header.closest("tr");
    // when id is present, the cell fallback key should include that id
    const bodyCell = await screen.findByTestId("rid-cell-row-0-col-myid");
    expect(bodyCell).toBeInTheDocument();
    expect(bodyCell).toHaveAttribute("data-fallback-key", "cell_0_myid");
    const tr = bodyCell.closest("tr");
    expect(tr).toHaveAttribute("data-fallback-key", "row_0");
  });

  test("pageSize prop forces pagination rendering when rows exceed pageSize", async () => {
    const cols = [{ Header: "C1", accessor: "a", id: "id1" }];
    const rows = [{ a: "v1" }, { a: "v2" }];
    // set pageSize to 1 to ensure rows.length > pageSize
    render(<OurTable columns={cols} data={rows} pageSize={1} testid={"pg"} />);

    expect(await screen.findByTestId("pg-next-page-button")).toBeInTheDocument();
    expect(await screen.findByTestId("pg-prev-page-button")).toBeInTheDocument();
    expect(await screen.findByTestId("pg-current-page-button")).toBeInTheDocument();
  });
});
