import { render, screen } from "@testing-library/react";
import Footer from "main/components/Nav/Footer";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

describe("Footer tests", () => {
    test("renders correctly", async () => {
        render(
            <Footer systemInfo={systemInfoFixtures.showingBoth} />
        );

        const text = screen.getByTestId("footer-content");
        expect(text).toBeInTheDocument();
        expect(typeof(text.textContent)).toBe('string');
        expect(text.textContent).toEqual('HappierCows is a project of Mattanjah de Vries, Distinguished Professor of Chemistry at UC Santa Barbara. The open source code is available on GitHub.');
            
        const repo_link = screen.getByTestId("repo-link");
        expect(repo_link).toHaveAttribute("href", systemInfoFixtures.showingBoth.sourceRepo);
    });

    test("repo-link renders correctly when systemInfo doesn't contain sourceRepo not available", async () => {
        render(
            <Footer systemInfo={{}} />
        );
      
        const repo_link = screen.getByTestId("repo-link");
        expect(repo_link).toHaveAttribute("href", "https://github.com/ucsb-cs156/proj-happycows");
    });

    test("repo-link renders correctly when systemInfo is null", async () => {
        render(
            <Footer systemInfo={null} />
        );
      
        const repo_link = screen.getByTestId("repo-link");
        expect(repo_link).toHaveAttribute("href", "https://github.com/ucsb-cs156/proj-happycows");
    });
});
