import { render, screen, waitFor } from "@testing-library/react";
import Profits from "main/components/Commons/Profits"; 
import userCommonsFixtures from "fixtures/userCommonsFixtures"; 
import profitsFixtures from "fixtures/profitsFixtures";

describe("Profits tests", () => {
    test("renders properly for empty profits array", () => {
        render(
            <Profits userCommons={userCommonsFixtures.oneUserCommons[0]} profits={[]} />
        );
    });

    test("renders properly when profits is not defined", async () => {
        render(
            <Profits userCommons={userCommonsFixtures.oneUserCommons[0]}  />
        );
        await waitFor(()=>{
            expect(screen.getByTestId("ProfitsTable-header-Profit") ).toBeInTheDocument();
        });
    });

    test("renders properly when profits is non-empty", async () => {
        render(
            <Profits userCommons={userCommonsFixtures.oneUserCommons[0]} profits={profitsFixtures.threeProfits} />
        );
           
        expect(await screen.findByTestId("ProfitsTable-cell-row-0-col-Profit")).toBeInTheDocument();
        expect(screen.getByTestId("ProfitsTable-cell-row-0-col-Profit")).toHaveTextContent(/52.80/);
        expect(screen.getByTestId("ProfitsTable-cell-row-1-col-Profit")).toHaveTextContent(/54.60/);
        expect(screen.getByTestId("ProfitsTable-cell-row-2-col-Profit")).toHaveTextContent(/58.20/);

        expect(screen.getByTestId("ProfitsTable-cell-row-0-col-timestamp")).toHaveTextContent("5/17/2023, 20:56:22");
        expect(screen.getByTestId("ProfitsTable-cell-row-1-col-timestamp")).toHaveTextContent("5/16/2023, 20:55:00");
        expect(screen.getByTestId("ProfitsTable-cell-row-2-col-timestamp")).toHaveTextContent("5/15/2023, 20:50:00");

        expect(screen.getByTestId("ProfitsTable-cell-row-0-col-Health")).toHaveTextContent(/88.000%/);
        expect(screen.getByTestId("ProfitsTable-cell-row-1-col-Health")).toHaveTextContent(/91.000%/);
        expect(screen.getByTestId("ProfitsTable-cell-row-2-col-Health")).toHaveTextContent(/97.000%/);

        expect(screen.getByTestId("ProfitsTable-cell-row-0-col-numCows")).toHaveTextContent(/6/);
        expect(screen.getByTestId("ProfitsTable-cell-row-1-col-numCows")).toHaveTextContent(/6/);
        expect(screen.getByTestId("ProfitsTable-cell-row-2-col-numCows")).toHaveTextContent(/6/);
    });
});
