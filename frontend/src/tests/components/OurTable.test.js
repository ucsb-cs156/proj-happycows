import { fireEvent, render, screen } from "@testing-library/react";
import OurTable, { ButtonColumn, DateColumn, PlaintextColumn } from "main/components/OurTable";

describe("OurTable tests (optimized)", () => {
    const generateRows = (count) => {
        return Array.from({ length: count }, (_, i) => ({
            col1: `Hello ${i}`,
            col2: `World ${i}`,
            createdAt: `2021-04-01T04:00:00.000`,
            log: `foo\nbar\n  baz ${i}`,
        }));
    };
    
    const hundredRows = Array.from({ length: 100 }, (_, i) => ({
        col1: `Hello ${i}`,
        col2: `World ${i}`,
        createdAt: "2021-04-01T04:00:00.000",
        log: `foo\nbar\n  baz ${i}`,
    }));
    

    const columns = [
        { Header: "Column 1", accessor: "col1" },
        { Header: "Column 2", accessor: "col2" },
        ButtonColumn("Click", "primary", jest.fn(), "testId"),
        DateColumn("Date", (cell) => cell.row.original.createdAt),
        PlaintextColumn("Log", (cell) => cell.row.original.log),
    ];

    const renderTable = (data, testid = "testid") =>
        render(<OurTable columns={columns} data={data} testid={testid} />);

    test("renders an empty table without crashing", () => {
        renderTable([]);
        expect(screen.queryByTestId("testid-prev-page-button")).toBeNull();
    });

    test("renders a table with data and pagination behavior", () => {
        const data = generateRows(15);
        renderTable(data);
        expect(screen.getByTestId("testid-next-page-button")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("testid-next-page-button"));
        expect(screen.getByTestId("testid-current-page-button")).toHaveTextContent("2");
    });

    test("button click triggers callback", async () => {
        const clickCallback = jest.fn();
        const buttonColumns = [
            ButtonColumn("Click", "primary", clickCallback, "testId"),
        ];
        render(<OurTable columns={buttonColumns} data={generateRows(3)} />);
        fireEvent.click(await screen.findByTestId("testId-cell-row-0-col-Click-button"));
        expect(clickCallback).toHaveBeenCalledTimes(1);
    });

    test.each([
        ["Column 1", "col1"],
        ["Column 2", "col2"],
    ])("sort toggles for %s", async (_, accessor) => {
        renderTable(generateRows(3));
        const header = await screen.findByTestId(`testid-header-${accessor}`);
        fireEvent.click(header);
        expect(await screen.findByText("🔼")).toBeInTheDocument();
        fireEvent.click(header);
        expect(await screen.findByText("🔽")).toBeInTheDocument();
    });

    test("pagination navigation works correctly", () => {
        const data = generateRows(60);
        renderTable(data);

        // Go to last page
        fireEvent.click(screen.getByTestId("testid-last-page-button"));
        expect(screen.getByTestId("testid-current-page-button")).toHaveTextContent("6");

        // Return to first page
        fireEvent.click(screen.getByTestId("testid-first-page-button"));
        expect(screen.getByTestId("testid-current-page-button")).toHaveTextContent("1");
    });

        test.each([
            [1, "testid-forward-one-page-button", "2"],
            [2, "testid-forward-two-page-button", "4"], // Corrected from "3" to "4"
            [3, "testid-back-one-page-button", "2"],   // Back to previous behavior
        ])("navigates using %s", async (currentPage, buttonId, expectedPage) => {
            renderTable(generateRows(60));
            for (let i = 1; i < currentPage; i++) {
                fireEvent.click(screen.getByTestId("testid-next-page-button"));
            }
            fireEvent.click(screen.getByTestId(buttonId));
            expect(await screen.findByTestId("testid-current-page-button")).toHaveTextContent(expectedPage);
        });

        test("table starts on page 1 (zero-based index 0)", () => {
            renderTable(generateRows(30));
            expect(screen.getByTestId("testid-current-page-button")).toHaveTextContent("1");
        });
        
        test("renders left ellipsis when on a later page", async () => {
            renderTable(hundredRows); // Ensure enough rows for pagination
        
            // Navigate to a page where the left ellipsis should appear (page 6)
            for (let i = 0; i < 5; i++) {
                fireEvent.click(screen.getByTestId("testid-next-page-button"));
            }
        
            // Check left ellipsis visibility
            expect(screen.getByTestId("testid-left-ellipsis")).toBeInTheDocument();
        });

        test("renders right ellipsis when not on the last few pages", async () => {
            renderTable(hundredRows); // Ensure enough rows for pagination
        
            // Check right ellipsis visibility from the first page
            expect(screen.getByTestId("testid-right-ellipsis")).toBeInTheDocument();
        });
        
        test("renders a table with 100 rows and tests back three pages button", async () => {
            render(<OurTable columns={columns} data={hundredRows} />);
        
            // Navigate to page 5 (zero-based index 4)
            for (let i = 0; i < 4; i++) {
                fireEvent.click(screen.getByTestId("testid-next-page-button"));
            }
        
            // Verify button visibility
            expect(screen.getByTestId("testid-back-three-page-button")).toBeInTheDocument();
        
            // Click the back three pages button
            fireEvent.click(screen.getByTestId("testid-back-three-page-button"));
        
            // Verify that the current page is 2
            expect(await screen.findByTestId("testid-current-page-button")).toContainHTML("2");
        });

        test("renders a table with 100 rows and tests back two pages button", async () => {
            render(<OurTable columns={columns} data={hundredRows} />);
        
            // Navigate to page 4 (0-based index 3)
            for (let i = 0; i < 3; i++) {
                fireEvent.click(screen.getByTestId("testid-next-page-button"));
            }
        
            // Confirm that the button is visible
            expect(screen.getByTestId("testid-back-two-page-button")).toBeInTheDocument();
        
            // Click the back two pages button
            fireEvent.click(screen.getByTestId("testid-back-two-page-button"));
        
            // Verify the page navigated back to 2 (0-based index 1)
            expect(await screen.findByTestId("testid-current-page-button")).toContainHTML("2");
        });
        
        

            test("previous page button decrements the page index", () => {
                const data = generateRows(60);
                renderTable(data);
            
                // Navigate to page 2
                fireEvent.click(screen.getByTestId("testid-next-page-button"));
                expect(screen.getByTestId("testid-current-page-button")).toHaveTextContent("2");
            
                // Click the "Previous" button
                fireEvent.click(screen.getByTestId("testid-prev-page-button"));
                expect(screen.getByTestId("testid-current-page-button")).toHaveTextContent("1");
            
        });

        test("renders a table with 100 rows and tests forward three pages button", async () => {
            render(<OurTable columns={columns} data={hundredRows} />);
        
            // Navigate to page 6 (0-based index 5)
            for (let i = 0; i < 5; i++) {
                fireEvent.click(screen.getByTestId("testid-next-page-button"));
            }
        
            // Confirm that the forward-three-pages button is visible
            expect(screen.getByTestId("testid-forward-three-page-button")).toBeInTheDocument();
        
            // Click the forward-three-pages button
            fireEvent.click(screen.getByTestId("testid-forward-three-page-button"));
        
            // Verify the page navigated to page 9 (0-based index 8)
            expect(await screen.findByTestId("testid-current-page-button")).toContainHTML("9");
        });

        test("correct rows are displayed for each page", () => {
            const data = generateRows(30); // 30 rows of data
            const pageSize = 10; // Each page should show 10 rows
            renderTable(data);
        
            // Page 1 (index 0)
            let rows = screen.getAllByRole("row");
            expect(rows).toHaveLength(pageSize + 1); // 10 rows + 1 header row
            expect(rows[1]).toHaveTextContent("Hello 0");
            expect(rows[10]).toHaveTextContent("Hello 9");
        
            // Navigate to page 2 (index 1)
            fireEvent.click(screen.getByTestId("testid-next-page-button"));
            rows = screen.getAllByRole("row");
            expect(rows).toHaveLength(pageSize + 1); // 10 rows + 1 header row
            expect(rows[1]).toHaveTextContent("Hello 10");
            expect(rows[10]).toHaveTextContent("Hello 19");
        
            // Navigate to page 3 (index 2)
            fireEvent.click(screen.getByTestId("testid-next-page-button"));
            rows = screen.getAllByRole("row");
            expect(rows).toHaveLength(pageSize + 1); // 10 rows + 1 header row
            expect(rows[1]).toHaveTextContent("Hello 20");
            expect(rows[10]).toHaveTextContent("Hello 29");
        });

        test("renders correct sort carets for columns", () => {
            renderTable(hundredRows);
        
            // Verify no caret initially
            expect(screen.getByTestId("testid-header-col1-sort-carets")).toHaveTextContent('');
        
            // Click to sort ascending
            fireEvent.click(screen.getByTestId("testid-header-col1"));
            expect(screen.getByTestId("testid-header-col1-sort-carets")).toHaveTextContent('🔼');
        
            // Click to sort descending
            fireEvent.click(screen.getByTestId("testid-header-col1"));
            expect(screen.getByTestId("testid-header-col1-sort-carets")).toHaveTextContent('🔽');
        });

        
     
});