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
    const COW_BUY_FAILURE_TOAST = "You can't buy a cow because you don't have enough money";
    // Expected toast strings for cow sale.
    const COW_SELL_TOAST = "Cow sold!";
    const COW_SELL_FAILURE_TOAST = "You can't sell a cow because you don't have enough cows";

    // Spy on toasts and return all toasts displayed so far.
    function spyToasts() {
        const toasts = [];
        toast.mockImplementation((...args) => toasts.push(args));
        return () => toasts;
    }

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
        // Start spying toast messages.
        const toasts = spyToasts();

        expect(await screen.findByTestId("buy-cow-button")).toBeInTheDocument();
        const buyCowButton = screen.getByTestId("buy-cow-button");

        expect(toasts().length).toBe(0);

        // Buying a cow with sufficient funds.
        fireEvent.click(buyCowButton);
        await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
        expect(toasts()[0][0]).toBe(COW_BUY_TOAST);
    });

    test("buying cows produces correct toast with insufficient funds", async () => {
        axiosMock.onGet("/api/usercommons/forcurrentuser", { params: { commonsId: 1 } }).reply(200, {
            ...userCommons,
            totalWealth: 0
        });
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PlayPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
        // Start spying toast messages.
        const toasts = spyToasts();

        expect(await screen.findByTestId("buy-cow-button")).toBeInTheDocument();
        const buyCowButton = screen.getByTestId("buy-cow-button");

        expect(toasts().length).toBe(0);

        fireEvent.click(buyCowButton);
        await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
        expect(toasts()[0][0]).toBe(COW_BUY_FAILURE_TOAST);
    });

    test("selling cows produces correct toast with sufficient cows", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PlayPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
        // Start spying toast messages.
        const toasts = spyToasts();

        expect(await screen.findByTestId("sell-cow-button")).toBeInTheDocument();
        const sellCowButton = screen.getByTestId("sell-cow-button");

        expect(toasts().length).toBe(0);

        // Buying a cow with sufficient cows.
        fireEvent.click(sellCowButton);
        await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
        expect(toasts()[0][0]).toBe(COW_SELL_TOAST);
    });

    test("selling cows produces correct toast with insufficient cows", async () => {
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
        // Start spying toast messages.
        const toasts = spyToasts();

        expect(await screen.findByTestId("sell-cow-button")).toBeInTheDocument();
        const sellCowButton = screen.getByTestId("sell-cow-button");

        expect(toasts().length).toBe(0);

        fireEvent.click(sellCowButton);
        await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
        expect(toasts()[0][0]).toBe(COW_SELL_FAILURE_TOAST);
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
