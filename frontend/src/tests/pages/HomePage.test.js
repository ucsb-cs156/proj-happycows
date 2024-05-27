import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import HomePage, {getRandomGreeting} from "main/pages/HomePage";
import commonsFixtures from "fixtures/commonsFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import "main/pages/HomePage.css"
import getBackgroundImage from "main/components/Utils/HomePageBackground";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({
        commonsId: 1
    }),
    useNavigate: () => mockNavigate
}));

describe("HomePage tests", () => {
    const queryClient = new QueryClient();
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
        jest.clearAllMocks();
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    });

    test("renders without crashing when lists return empty list", async () => {
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/commons/all").reply(200, []);
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <HomePage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        const mainDiv = screen.getByTestId("HomePage-main-div");
        expect(mainDiv).toBeInTheDocument();

        const title = screen.getByTestId("homePage-title");
        expect(title).toBeInTheDocument();
        expect(typeof (title.textContent)).toBe('string');
        
        await waitFor(() => {
            expect(title.textContent).toContain('Farmer Phillip!');
        });
    });

    test("getRandomGreeting returns a valid greeting", () => {
        const greetings = [
            "Howdy Farmer",
            "Hello Farmer",
            "Hi Farmer",
            "Greetings Farmer",
            "Welcome Farmer",
            "Hey there Farmer",
            "Good to see you Farmer",
            "Salutations Farmer",
            "What's up Farmer",
            "Ahoy Farmer",
            "Good day Farmer",
            "Pleased to see you Farmer",
            "Welcome back Farmer",
            "Hello there Farmer",
        ];
    
        for (let i = 0; i < 100; i++) {
            const greeting = getRandomGreeting();
            expect(greetings).toContain(greeting);
        }
    });

    test("getRandomGreeting uses correct randomIndex", () => {
        const greetings = [
            "Howdy Farmer",
            "Hello Farmer",
            "Hi Farmer",
            "Greetings Farmer",
            "Welcome Farmer",
            "Hey there Farmer",
            "Good to see you Farmer",
            "Salutations Farmer",
            "What's up Farmer",
            "Ahoy Farmer",
            "Good day Farmer",
            "Pleased to see you Farmer",
            "Welcome back Farmer",
            "Hello there Farmer",
        ];

        const mockMath = Object.create(global.Math);
        mockMath.random = () => 0.5; // This will return a fixed value
        global.Math = mockMath;

        const greeting = getRandomGreeting();
        const expectedIndex = Math.floor(0.5 * greetings.length);
        expect(greeting).toBe(greetings[expectedIndex]);

        global.Math = mockMath; // Restore original Math.random
    });

    test("renders with default for commons when api times out", () => {
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/commons/all").timeout();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <HomePage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        const mainDiv = screen.getByTestId("HomePage-main-div");
        expect(mainDiv).toBeInTheDocument();

        const title = screen.getByTestId("homePage-title");
        expect(title).toBeInTheDocument();
        expect(typeof (title.textContent)).toBe('string');
        expect(title.textContent).toContain('Farmer Phillip!');
    });

    test("expected CSS properties", () => {
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/commons/all").reply(200, []);
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <HomePage />
                </MemoryRouter>
            </QueryClientProvider>
        );        
        const title = screen.getByTestId("homePage-title");
        expect(title).toHaveAttribute("class", "new-title");
        });

    test("renders without crashing when lists are full", () => {
        apiCurrentUserFixtures.userOnly.user.commons = commonsFixtures.oneCommons;
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/commons/all").reply(200, commonsFixtures.threeCommons);
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <HomePage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        const title = screen.getByTestId("homePage-title");
        expect(title).toBeInTheDocument();
        expect(typeof (title.textContent)).toBe('string');
        expect(title.textContent).toContain('Farmer Phillip!');
    });

    test("Redirects to the PlayPage when you click visit", async () => {
        apiCurrentUserFixtures.userOnly.user.commons = commonsFixtures.oneCommons;
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/commons/all").reply(200, commonsFixtures.threeCommons);
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <HomePage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByTestId("commonsCard-button-Visit-1")).toBeInTheDocument();
        const visitButton = screen.getByTestId("commonsCard-button-Visit-1");
        fireEvent.click(visitButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/play/1");
        });
    });

    test("Calls the callback when you click join", async () => {
        apiCurrentUserFixtures.userOnly.user.commons = commonsFixtures.oneCommons;
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/commons/all").reply(200, commonsFixtures.threeCommons);
        axiosMock.onPost("/api/commons/join").reply(200, commonsFixtures.threeCommons[0]);

        
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <HomePage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByTestId("commonsCard-button-Join-4")).toBeInTheDocument();
        const joinButton = screen.getByTestId("commonsCard-button-Join-4");
        fireEvent.click(joinButton);

        await waitFor(() => {
            expect(axiosMock.history.post.length).toBe(1);
        });
        expect(axiosMock.history.post[0].url).toBe("/api/commons/join");
        expect(axiosMock.history.post[0].params).toEqual({ "commonsId": 4 });
    
    });

    test("Check hour null is working, and that the background image is set correctly", async () => {
        apiCurrentUserFixtures.userOnly.user.commons = commonsFixtures.oneCommons;
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/commons/all").reply(200, commonsFixtures.threeCommons);
        axiosMock.onPost("/api/commons/join").reply(200, commonsFixtures.threeCommons[0]);

        
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <HomePage hour={12}/>
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByTestId("commonsCard-button-Join-4")).toBeInTheDocument();
        const joinButton = screen.getByTestId("commonsCard-button-Join-4");
        fireEvent.click(joinButton);

        await waitFor(() => {
            expect(axiosMock.history.post.length).toBe(1);
        });
        expect(axiosMock.history.post[0].url).toBe("/api/commons/join");
        expect(axiosMock.history.post[0].params).toEqual({ "commonsId": 4 });

    });

    test("Home page intro card has the correct styles applied", async () => {
        apiCurrentUserFixtures.userOnly.user.commons = commonsFixtures.oneCommons;
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/commons/all").reply(200, commonsFixtures.threeCommons);
        axiosMock.onPost("/api/commons/join").reply(200, commonsFixtures.threeCommons[0]);

        
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <HomePage hour={12}/>
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByTestId("HomePage-intro-card")).toBeInTheDocument();
        
        const HomePageDiv = screen.getByTestId("HomePage-main-div");
        expect(HomePageDiv).toHaveStyle('backgroundSize: cover;');       
        
        const Background = getBackgroundImage(12);
        expect(HomePageDiv).toHaveStyle(`backgroundImage: url(${Background});`);       


        expect(await screen.findByTestId("HomePage-intro-card")).toBeInTheDocument();
    
        const HomePageCard = screen.getByTestId("HomePage-intro-card");
        expect(HomePageCard).toHaveAttribute("class", "title-box");

    });

});
