import { render, screen, waitFor } from "@testing-library/react";
import ProfitsTable from "main/components/Commons/ProfitsTable";
import profitsFixtures from "fixtures/profitsFixtures";

describe("ProfitsTable tests", () => {
    test("renders without crashing for 0 profits", () => {
        render(
            <ProfitsTable profits={[]} />
        );
    });

    test("renders without crashing", async () => {
        render(
            <ProfitsTable profits={profitsFixtures.threeProfits} />
        );
        await waitFor(()=>{
            expect(screen.getByTestId("ProfitsTable-header-Profit") ).toBeInTheDocument();
        });

        const expectedHeaders = [ "Profit", "Date", "Health", "Cows"];
    
        expectedHeaders.forEach((headerText) => {
          const header = screen.getByText(headerText);
          expect(header).toBeInTheDocument();
        });

    });
    test("shows expected headers and fields for ProfitsTable", () => {
        render(<ProfitsTable profits= {profitsFixtures.threeProfits} />);
  
        const headers = ["Profit", "Date", "Health", "Cows"];
        const testId = "ProfitsTable";
  
  
        headers.forEach((header) => {
          expect(screen.getByText(header)).toBeInTheDocument();
        });
  
        const firstProfit = profitsFixtures.threeProfits[0];
        expect(screen.getByTestId(`${testId}-cell-row-0-col-Profit`)).toHaveTextContent(
          `$${firstProfit.amount.toFixed(2)}`
        );
  
        expect(screen.getByTestId(`${testId}-cell-row-0-col-date`)).toBeInTheDocument(); 
  
        expect(screen.getByTestId(`${testId}-cell-row-0-col-Health`)).toHaveTextContent(
          `${firstProfit.avgCowHealth}%`
        );
  
        expect(screen.getByTestId(`${testId}-cell-row-0-col-numCows`)).toBeInTheDocument(
          firstProfit.numCows.toString()
        );
      });
});