import { render, screen, waitFor } from "@testing-library/react";
import CommonsPlay from "main/components/Commons/CommonsPlay"; 
import commonsFixtures from "fixtures/commonsFixtures"; 
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import greetingsList from "../../../assets/PlayGreetings.json"

describe("CommonsPlay tests", () => {
    test("renders without crashing when user is userOnly", () => {
        render(
            <CommonsPlay currentUser={currentUserFixtures.userOnly } commons={commonsFixtures.oneCommons[0]} />
        );
    });

    test("renders without crashing when user is admin", () => {
        render(
            <CommonsPlay currentUser={currentUserFixtures.adminUser } commons={commonsFixtures.oneCommons[0]} />
        );
    });

    test("renders without crashing when currentUser.root is undefined", async () => {
        render(
            <CommonsPlay currentUser={currentUserFixtures.noRoot } commons={commonsFixtures.oneCommons[0]} />
        );

        await waitFor(()=>{
            expect(screen.getByTestId("CommonsPlay")).toBeInTheDocument();
        });

    });
    test("Commons Play has the correct styles applied", async () => {
        render(
            <CommonsPlay currentUser={currentUserFixtures.noRoot } commons={commonsFixtures.oneCommons[0]} />
        );

        await waitFor(()=>{
            expect(screen.getByTestId("commons-card")).toBeInTheDocument();
        });
    });
    test("Tests for not logged in", async () => {
        render(
            <CommonsPlay currentUser={currentUserFixtures.notLoggedIn } commons={commonsFixtures.oneCommons[0]} />
        );
        await waitFor(()=>{
            expect(screen.getByTestId("commons-card")).toBeInTheDocument();
        });
    });
    test("Tests for welcome text", async () => {
        // the use of mockMath is documented here: https://stackoverflow.com/questions/41570273/how-to-test-a-function-that-output-is-random-using-jest
        const mockMath = Object.create(global.Math);
        mockMath.random = () => 0.5;
        global.Math = mockMath;

        render(
            <CommonsPlay currentUser={currentUserFixtures.userOnly} commons={commonsFixtures.oneCommons[0]} />
        );

        const expectedGreeting = greetingsList[Math.floor(0.5 * greetingsList.length)];
        
        const greetingElement = screen.getByTestId("commonsPlay-title");
        expect(greetingElement.textContent).toContain(expectedGreeting);

        global.Math = Object.create(global.Math);
    });
});
