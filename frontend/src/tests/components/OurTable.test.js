import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  const clickMeCallback = jest.fn();

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
      await screen.findByTestId("testId-cell-row-0-col-Click-button")
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
      <OurTable columns={columns} data={threeRows} testid={"sampleTestId"} />
    );

    expect(
      await screen.findByTestId("sampleTestId-header-col1")
    ).toBeInTheDocument();
    const col1Header = screen.getByTestId("sampleTestId-header-col1");

    const col1SortCarets = screen.getByTestId(
      "sampleTestId-header-col1-sort-carets"
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
      await screen.findByTestId("testid-prev-page-button")
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("testid-next-page-button")
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("testid-current-page-button")
    ).toBeInTheDocument();
  });

  test("renders a table with 11 rows and clicks on the next page button and previous page button", async () => {
    render(<OurTable columns={columns} data={elevenRows} />);

    expect(
      await screen.findByTestId("testid-next-page-button")
    ).toBeInTheDocument();
    expect(
      (await screen.findByTestId("testid-prev-page-button")).hasAttribute(
        "disabled"
      )
    ).toBe(true);
    expect(
      (await screen.findByTestId("testid-next-page-button")).hasAttribute(
        "disabled"
      )
    ).toBe(false);
    const nextButton = screen.getByTestId("testid-next-page-button");
    expect(await screen.findByText(`Hello 10`)).toBeInTheDocument();
    expect(screen.queryByText(`Hello 11`)).not.toBeInTheDocument();
    expect(
      await screen.findByTestId("testid-current-page-button")
    ).toContainHTML("1");
    fireEvent.click(nextButton);
    expect(
      await screen.findByTestId("testid-current-page-button")
    ).toContainHTML("2");
    expect(
      (await screen.findByTestId("testid-prev-page-button")).hasAttribute(
        "disabled"
      )
    ).toBe(false);
    expect(
      (await screen.findByTestId("testid-next-page-button")).hasAttribute(
        "disabled"
      )
    ).toBe(true);
    expect(await screen.findByText(`Hello 11`)).toBeInTheDocument();
    const prevButton = screen.getByTestId("testid-prev-page-button");
    fireEvent.click(prevButton);
    expect(await screen.findByText(`Hello 1`)).toBeInTheDocument();
  });

  test("renders a table with 51 rows and tests the first page", async () => {
    render(<OurTable columns={columns} data={fiftyOneRows} />);
    expect(
      await screen.findByTestId("testid-next-page-button")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("testid-left-ellipsis")).toBe(null);
    expect(screen.queryByTestId("testid-back-three-page-button")).toBe(null);
    expect(screen.queryByTestId("testid-back-two-page-button")).toBe(null);
    expect(screen.queryByTestId("testid-back-one-page-button")).toBe(null);
    expect(
      await screen.findByTestId("testid-current-page-button")
    ).toContainHTML("1");
    expect(
      await screen.findByTestId("testid-forward-one-page-button")
    ).toContainHTML("2");
    expect(
      await screen.findByTestId("testid-forward-two-page-button")
    ).toContainHTML("3");
    expect(screen.queryByTestId("testid-forward-three-page-button")).toBe(null);
    expect(
      await screen.findByTestId("testid-right-ellipsis")
    ).toBeInTheDocument();
    expect(await screen.findByTestId("testid-last-page-button")).toContainHTML(
      "6"
    );
    expect(await screen.findByText(`Hello 10`)).toBeInTheDocument();
  });

  test("renders a table with 51 rows and tests moving forward and back one page", async () => {
    render(<OurTable columns={columns} data={fiftyOneRows} />);

    expect(
      await screen.findByTestId("testid-forward-one-page-button")
    ).toBeInTheDocument();
    expect(
      (await screen.findByTestId("testid-prev-page-button")).hasAttribute(
        "disabled"
      )
    ).toBe(true);
    expect(
      (await screen.findByTestId("testid-next-page-button")).hasAttribute(
        "disabled"
      )
    ).toBe(false);
    const forwardOneButton = screen.getByTestId(
      "testid-forward-one-page-button"
    );
    fireEvent.click(forwardOneButton);
    expect(
      await screen.findByTestId("testid-current-page-button")
    ).toContainHTML("2");
    expect(
      await screen.findByTestId("testid-forward-one-page-button")
    ).toContainHTML("3");
    expect(
      await screen.findByTestId("testid-forward-one-page-button")
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("testid-back-one-page-button")
    ).toContainHTML("1");
    const backOneButton = screen.getByTestId("testid-back-one-page-button");
    fireEvent.click(backOneButton);
    expect(
      await screen.findByTestId("testid-current-page-button")
    ).toContainHTML("1");
    expect(
      await screen.findByTestId("testid-forward-one-page-button")
    ).toContainHTML("2");
    const lastButton = screen.getByTestId("testid-last-page-button");
    fireEvent.click(lastButton);
    expect(
      (await screen.findByTestId("testid-prev-page-button")).hasAttribute(
        "disabled"
      )
    ).toBe(false);
    expect(
      (await screen.findByTestId("testid-next-page-button")).hasAttribute(
        "disabled"
      )
    ).toBe(true);
    expect(
      await screen.findByTestId("testid-current-page-button")
    ).toContainHTML("6");
    expect(await screen.findByText(`Hello 51`)).toBeInTheDocument();
    expect(screen.queryByText(`Hello 11`)).not.toBeInTheDocument();
    expect(
      await screen.findByTestId("testid-back-one-page-button")
    ).toContainHTML("5");
  });

  test("renders a table with 51 rows and tests the first and last page buttons", async () => {
    render(<OurTable columns={columns} data={fiftyOneRows} />);

    expect(
      await screen.findByTestId("testid-next-page-button")
    ).toBeInTheDocument();
    expect(
      (await screen.findByTestId("testid-prev-page-button")).hasAttribute(
        "disabled"
      )
    ).toBe(true);
    expect(
      (await screen.findByTestId("testid-next-page-button")).hasAttribute(
        "disabled"
      )
    ).toBe(false);
    const lastButton = screen.getByTestId("testid-last-page-button");
    const rightEllipsis = screen.getByTestId("testid-right-ellipsis");
    fireEvent.click(lastButton);
    expect(
      await screen.findByTestId("testid-current-page-button")
    ).toContainHTML("6");
    expect(await screen.findByText(`Hello 51`)).toBeInTheDocument();
    expect(rightEllipsis).not.toBeInTheDocument();
    expect(lastButton).not.toBeInTheDocument();
    expect(
      await screen.findByTestId("testid-left-ellipsis")
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("testid-back-two-page-button")
    ).toContainHTML("4");
    expect(
      await screen.findByTestId("testid-back-one-page-button")
    ).toContainHTML("5");
    expect(await screen.findByTestId("testid-first-page-button")).toContainHTML(
      "1"
    );
    const firstButton = screen.getByTestId("testid-first-page-button");
    fireEvent.click(firstButton);
    expect(firstButton).not.toBeInTheDocument();
  });

  test("renders a table with 51 rows and moving forward and back two pages", async () => {
    render(<OurTable columns={columns} data={fiftyOneRows} />);

    expect(
      await screen.findByTestId("testid-next-page-button")
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("testid-forward-two-page-button")
    ).toContainHTML("3");
    const forwardTwoButton = screen.getByTestId(
      "testid-forward-two-page-button"
    );
    fireEvent.click(forwardTwoButton);
    expect(
      await screen.findByTestId("testid-current-page-button")
    ).toContainHTML("3");
    const backTwoButton = screen.getByTestId("testid-back-two-page-button");
    fireEvent.click(backTwoButton);
    expect(await screen.findByTestId("testid-last-page-button")).toContainHTML(
      "6"
    );
    expect(screen.queryByTestId("testid-back-two-page-button")).toBe(null);
    const lastButton = screen.getByTestId("testid-last-page-button");
    fireEvent.click(lastButton);
    expect(
      await screen.findByTestId("testid-current-page-button")
    ).toContainHTML("6");
    expect(screen.queryByTestId("testid-forward-two-page-button")).toBe(null);
    expect(
      await screen.findByTestId("testid-back-one-page-button")
    ).toContainHTML("5");
    const backOneButton = screen.getByTestId("testid-back-one-page-button");
    fireEvent.click(backOneButton);
    expect(
      await screen.findByTestId("testid-current-page-button")
    ).toContainHTML("5");
    expect(screen.queryByTestId("testid-left-ellipsis")).toBe(null);
    expect(screen.queryByTestId("testid-forward-two-page-button")).toBe(null);
    fireEvent.click(backOneButton);
    expect(
      await screen.findByTestId("testid-current-page-button")
    ).toContainHTML("4");
    expect(
      await screen.findByTestId("testid-forward-two-page-button")
    ).toContainHTML("6");
    fireEvent.click(await screen.findByTestId("testid-back-two-page-button"));
    expect(
      await screen.findByTestId("testid-current-page-button")
    ).toContainHTML("2");
    expect(screen.queryByTestId("testid-back-two-page-button")).toBe(null);
    fireEvent.click(await screen.findByTestId("testid-next-page-button"));
    expect(
      await screen.findByTestId("testid-back-two-page-button")
    ).toContainHTML("1");
  });

  test("renders a table with 41 rows and moving forward and back three pages", async () => {
    render(<OurTable columns={columns} data={fortyOneRows} />);

    expect(screen.queryByTestId("testid-back-three-page-button")).toBe(null);
    const forwardThreeButton = screen.getByTestId(
      "testid-forward-three-page-button"
    );
    fireEvent.click(forwardThreeButton);
    expect(
      await screen.findByTestId("testid-current-page-button")
    ).toContainHTML("4");
    expect(screen.queryByTestId("testid-forward-three-page-button")).toBe(null);
    expect(screen.queryByTestId("testid-first-page-button")).toBe(null);
    fireEvent.click(screen.getByTestId("testid-forward-one-page-button"));
    expect(
      await screen.findByTestId("testid-back-three-page-button")
    ).toContainHTML("2");
    const backThreeButton = screen.getByTestId("testid-back-three-page-button");
    fireEvent.click(backThreeButton);
    expect(
      await screen.findByTestId("testid-current-page-button")
    ).toContainHTML("2");
    expect(screen.queryByTestId("testid-back-three-page-button")).toBe(null);
    const forwardOneButton = screen.getByTestId(
      "testid-forward-one-page-button"
    );
    fireEvent.click(forwardOneButton);
    expect(
      await screen.findByTestId("testid-current-page-button")
    ).toContainHTML("3");
    expect(screen.queryByTestId("testid-forward-three-page-button")).toBe(null);
    expect(screen.queryByTestId("testid-back-three-page-button")).toBe(null);
    fireEvent.click(forwardOneButton);
    expect(
      await screen.findByTestId("testid-current-page-button")
    ).toContainHTML("4");
    expect(screen.queryByTestId("testid-forward-three-page-button")).toBe(null);
    expect(screen.queryByTestId("testid-back-three-page-button")).toBe(null);
  });
});
