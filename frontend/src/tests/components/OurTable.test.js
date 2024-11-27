import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import OurTable, { ButtonColumn, DateColumn, PlaintextColumn } from "main/components/OurTable";

describe("OurTable tests", () => {
    const generateRows = (num) =>
        Array.from({ length: num }, (_, i) => ({
            col1: `Hello ${i}`,
            col2: `World ${i}`,
            createdAt: `2021-04-01T04:00:00.000`,
            log: `foo\nbar\n  baz ${i}`,
        }));

    const threeRows = generateRows(3);
    const tenRows = generateRows(10);
    const elevenRows = generateRows(11);
    const thirtyRows = generateRows(30);
    const hundredRows = generateRows(100);

    const clickMeCallback = jest.fn();

    const columns = [
        {
            Header: "Column 1",
            accessor: "col1",
        },
        {
            Header: "Column 2",
            accessor: "col2",
        },
        ButtonColumn("Click", "primary", clickMeCallback, "testId"),
        DateColumn("Date", (cell) => cell.row.original.createdAt),
        PlaintextColumn("Log", (cell) => cell.row.original.log),
    ];

    const checkPaginationVisibility = async (visible = true) => {
        const testIds = [
            "testid-prev-page-button",
            "testid-next-page-button",
            "testid-current-page-button",
        ];
        for (const id of testIds) {
            if (visible) {
                expect(await screen.findByTestId(id)).toBeInTheDocument();
            } else {
                expect(screen.queryByTestId(id)).toBeNull();
            }
        }
    };

    test("renders an empty table without crashing", () => {
        render(<OurTable columns={columns} data={[]} />);
        checkPaginationVisibility(false);
    });

    test("renders a table with three rows", () => {
        render(<OurTable columns={columns} data={threeRows} />);
        checkPaginationVisibility(false);
    });

    test("button interaction triggers callback", async () => {
        render(<OurTable columns={columns} data={threeRows} />);
        const button = await screen.findByTestId("testId-cell-row-0-col-Click-button");
        fireEvent.click(button);
        await waitFor(() => expect(clickMeCallback).toBeCalledTimes(1));
    });

    test("pagination appears when rows exceed page size", async () => {
        render(<OurTable columns={columns} data={elevenRows} />);
        await checkPaginationVisibility(true);
    });

    test("pagination works with 30 rows", async () => {
        render(<OurTable columns={columns} data={thirtyRows} />);
        const nextButton = await screen.findByTestId("testid-next-page-button");
        fireEvent.click(nextButton);
        expect(await screen.findByTestId("testid-current-page-button")).toContainHTML("2");
    });

    test("navigating to the last page works", async () => {
        render(<OurTable columns={columns} data={hundredRows} />);
        const lastButton = await screen.findByTestId("testid-last-page-button");
        fireEvent.click(lastButton);
        expect(await screen.findByTestId("testid-current-page-button")).toContainHTML("10");
        expect(await screen.findByText("Hello 99")).toBeInTheDocument();
    });

    test("navigating back to the first page works", async () => {
        render(<OurTable columns={columns} data={hundredRows} />);
        const lastButton = await screen.findByTestId("testid-last-page-button");
        fireEvent.click(lastButton);
        const firstButton = await screen.findByTestId("testid-first-page-button");
        fireEvent.click(firstButton);
        expect(await screen.findByTestId("testid-current-page-button")).toContainHTML("1");
    });
});
