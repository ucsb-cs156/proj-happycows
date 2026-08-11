import { render, screen, waitFor } from "@testing-library/react";
import GamePlay from "main/components/Game/GamePlay";
import gameFixtures from "fixtures/gameFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

describe("GamePlay tests", () => {
  test("renders without crashing when user is userOnly", () => {
    render(
      <GamePlay
        currentUser={currentUserFixtures.userOnly}
        game={gameFixtures.oneGame[0]}
      />,
    );
  });

  test("renders without crashing when user is admin", () => {
    render(
      <GamePlay
        currentUser={currentUserFixtures.adminUser}
        game={gameFixtures.oneGame[0]}
      />,
    );
  });

  test("renders without crashing when currentUser.root is undefined", async () => {
    render(
      <GamePlay
        currentUser={currentUserFixtures.noRoot}
        game={gameFixtures.oneGame[0]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("GamePlay")).toBeInTheDocument();
    });
  });
  test("Game Play has the correct styles applied", async () => {
    render(
      <GamePlay
        currentUser={currentUserFixtures.noRoot}
        game={gameFixtures.oneGame[0]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("game-card")).toBeInTheDocument();
    });
  });
});
