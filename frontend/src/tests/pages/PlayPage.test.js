import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { toast } from "react-toastify";

import PlayPage from "main/pages/PlayPage";
import commonsFixtures from "fixtures/commonsFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import userCommonsFixtures from "fixtures/userCommonsFixtures";



jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({
        commonsId: 1
    })
}));

jest.mock("react-toastify", () => ({
    ...jest.requireActual("react-toastify"),
    toast: jest.fn(),
}));

describe("PlayPage tests", () => {
    const axiosMock = new AxiosMockAdapter(axios);
    const queryClient = new QueryClient();

    // Commons fixtures.
    const userCommons = userCommonsFixtures.oneUserCommons[0];
    const sampleCommons = commonsFixtures.oneCommons[0];
    // Expected toast strings for cow purchase.
    const expectedCowBoughtToast = "Cow bought!";
    const expectedCowBuyFailureToast = "You can't buy a cow because you don't have enough money";

    // Spy on toasts and return all toasts displayed so far.
    function spyToasts() {
        const toasts = [];
        toast.mockImplementation((...args) => toasts.push(args));
        return () => toasts;
    }

    const startingWealth = userCommons.totalWealth;

    beforeEach(() => {
        axiosMock.reset();
        axiosMock.resetHistory();

        userCommons.totalWealth = startingWealth;

        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
        axiosMock.onGet("/api/usercommons/forcurrentuser", { params: { commonsId: 1 } }).reply(200, userCommons);
        axiosMock.onGet("/api/commons", { params: { id: 1 } }).reply(200, sampleCommons);
        axiosMock.onGet("/api/commons/all").reply(200, [
            sampleCommons
        ]);
        axiosMock.onGet("/api/profits/all/commons").reply(200, []);

        axiosMock.onPut("/api/usercommons/sell").reply(200, userCommons);
        axiosMock.onPut("/api/usercommons/buy").reply(_config => {
            // Basic mock of cow purchase semantics.
            if (userCommons.totalWealth >= sampleCommons.cowPrice) {
                userCommons.totalWealth -= sampleCommons.cowPrice;
                userCommons.numOfCows += 1;
            }
            return [200];
        }, userCommons);
    });

    test("renders without crashing", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PlayPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
    });

    test("click buy and sell buttons", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PlayPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByTestId("buy-cow-button")).toBeInTheDocument();
        const buyCowButton = screen.getByTestId("buy-cow-button");
        fireEvent.click(buyCowButton);

        await waitFor(() => expect(axiosMock.history.put.length).toBe(1));

        const sellCowButton = screen.getByTestId("sell-cow-button");
        fireEvent.click(sellCowButton);

        await waitFor(() => expect(axiosMock.history.put.length).toBe(2));
    });

    test("buying cows produces correct toast depending on funds on hand", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PlayPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
        // Start spying toast messages.
        const toasts = spyToasts();

        const cowPrice = sampleCommons.cowPrice;
        let wealth = userCommons.totalWealth;

        expect(await screen.findByTestId("buy-cow-button")).toBeInTheDocument();
        const buyCowButton = screen.getByTestId("buy-cow-button");

        expect(toasts().length).toBe(0);

        // We expect to see the cow bought toast until the wealth on hand drops beneath the cow price.
        let puts = 0;
        while (wealth >= cowPrice) {
            console.log('cow buy', puts)
            fireEvent.click(buyCowButton);
            // Wait for the cow to be bought. (Using ++ in toBe will not work.)
            puts += 1;
            await waitFor(() => expect(axiosMock.history.put.length).toBe(puts));
            // Check the latest toast.
            expect(toasts().slice(-1)[0][0]).toBe(expectedCowBoughtToast);
            wealth -= cowPrice;
        }
        // We should no longer have enough funds to buy any further cows.
        fireEvent.click(buyCowButton);
        fireEvent.click(buyCowButton);
        // Check that the right message was displayed for a cow buy failure.
        expect(toasts().slice(-1)[0][0]).toBe(expectedCowBuyFailureToast);
    });

    test("Make sure that both the Announcements and Welcome Farmer components show up", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PlayPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Announcements/)).toBeInTheDocument();
        expect(await screen.findByText(/Welcome Farmer/)).toBeInTheDocument();
    });
});
