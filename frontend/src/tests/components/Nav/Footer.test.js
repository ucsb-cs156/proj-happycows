import { render, screen } from "@testing-library/react";
import Footer from "main/components/Nav/Footer";
import {QueryClient, QueryClientProvider} from "react-query";
import {systemInfoFixtures} from "../../../fixtures/systemInfoFixtures";
import {MemoryRouter} from "react-router-dom";

describe("Footer tests", () => {
    const queryClient = new QueryClient();

    test("renders correctly", async () => {
        render(
            <Footer />
        );

        const text = screen.getByTestId("footer-content");
        expect(text).toBeInTheDocument();
        expect(typeof(text.textContent)).toBe('string');
        expect(text.textContent).toEqual('HappierCows is a project of Mattanjah de Vries, Distinguished Professor of Chemistry at UC Santa Barbara. The open source code is available on GitHub.');
    });

    test("source repo link is pulled from `/api/sourceInfo`", async () => {
        const systemInfo = systemInfoFixtures.showingBoth;

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <Footer systemInfo={systemInfo}/>
                </MemoryRouter>
            </QueryClientProvider>
        );

        const sourceRepoAnchor = await screen.findByTestId("sourceRepo");
        expect(sourceRepoAnchor).toBeInTheDocument();
        expect(sourceRepoAnchor.getAttribute("href")).toBe(systemInfo.sourceRepo);
    });

    test("source repo links to `about:blank` when sourceRepo returned is nullish", async () => {
        const systemInfo = { ...systemInfoFixtures.showingBoth, sourceRepo: undefined };

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <Footer systemInfo={systemInfo}/>
                </MemoryRouter>
            </QueryClientProvider>
        );

        const sourceRepoAnchor = await screen.findByTestId("sourceRepo");
        expect(sourceRepoAnchor).toBeInTheDocument();
        expect(sourceRepoAnchor.getAttribute("href")).toBe("about:blank");
    });
});
