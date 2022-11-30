import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

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
    const COW_BUY_TOAST = "Cow bought!";
    // Expected toast string for when a cow purchase fails.
    const COW_BUY_FAILURE_TOAST = "You can't buy a cow because you don't have enough money";
    // Expected toast strings for cow sale.
    const COW_SELL_TOAST = "Cow sold!";
    // Expected toast string for when a cow sale fails.
    const COW_SELL_FAILURE_TOAST = "You have already sold all of your cows";

    beforeEach(() => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
        axiosMock.onGet("/api/usercommons/forcurrentuser", { params: { commonsId: 1 } }).reply(200, userCommons);
        axiosMock.onGet("/api/commons", { params: { id: 1 } }).reply(200, sampleCommons);
        axiosMock.onGet("/api/commons/all").reply(200, [
            sampleCommons
        ]);
        axiosMock.onGet("/api/profits/all/commons").reply(200, []);
        axiosMock.onPut("/api/usercommons/sell").reply(200, userCommons);
        axiosMock.onPut("/api/usercommons/buy").reply(200, userCommons);
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

    test("buying cows produces correct toast with sufficient funds", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PlayPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
        expect(userCommons.totalWealth).toBeGreaterThanOrEqual(sampleCommons.cowPrice);

        expect(await screen.findByTestId("buy-cow-button")).toBeInTheDocument();
        const buyCowButton = screen.getByTestId("buy-cow-button");

        // We have enough wealth to afford a cow. Attempt to buy a cow.
        fireEvent.click(buyCowButton);
        await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
        expect(toast).toHaveBeenCalledTimes(1);
        expect(toast).toHaveBeenCalledWith(COW_BUY_TOAST);
    });

    test("buying cows produces correct toast with insufficient funds", async () => {
        // The user cannot afford a cow.
        axiosMock.onGet("/api/usercommons/forcurrentuser", { params: { commonsId: 1 } }).reply(200, {
            ...userCommons,
            totalWealth: sampleCommons.cowPrice - 1
        });
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PlayPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByTestId("buy-cow-button")).toBeInTheDocument();
        const buyCowButton = screen.getByTestId("buy-cow-button");

        // Attempt to buy a cow without having sufficient wealth.
        fireEvent.click(buyCowButton);
        await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
        expect(toast).toHaveBeenCalledTimes(1);
        expect(toast).toHaveBeenCalledWith(COW_BUY_FAILURE_TOAST);
    });

    test("selling cows produces correct toast with sufficient cows", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PlayPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
        expect(userCommons.numOfCows).toBeGreaterThan(0);

        expect(await screen.findByTestId("sell-cow-button")).toBeInTheDocument();
        const sellCowButton = screen.getByTestId("sell-cow-button");

        // We sell one of our non-zero cows.
        fireEvent.click(sellCowButton);
        await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
        expect(toast).toHaveBeenCalledTimes(1);
        expect(toast).toHaveBeenCalledWith(COW_SELL_TOAST);
    });

    test("selling cows produces correct toast with insufficient cows", async () => {
        // The user does not have any cows to sell.
        axiosMock.onGet("/api/usercommons/forcurrentuser", { params: { commonsId: 1 } }).reply(200, {
            ...userCommons,
            numOfCows: 0
        });
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PlayPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByTestId("sell-cow-button")).toBeInTheDocument();
        const sellCowButton = screen.getByTestId("sell-cow-button");

        // We attempt to sell a nonexistent cow.
        fireEvent.click(sellCowButton);
        await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
        expect(toast).toHaveBeenCalledTimes(1);
        expect(toast).toHaveBeenCalledWith(COW_SELL_FAILURE_TOAST);
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
