import { render, screen } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router";
import GameSelect from "main/components/Game/GameSelect";
import { QueryClient, QueryClientProvider } from "react-query";
import gameFixtures from "fixtures/gameFixtures";
import { vi } from "vitest";

describe("GameSelect tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultTestId = "GameSelect";

  it("renders correctly", async () => {
    const game = gameFixtures.threeGame;

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <GameSelect
            game={game}
            handleGameSelection={() => {}}
            selectedGame={{}}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId(`${defaultTestId}-GameSelect-div`),
    ).toBeInTheDocument();
  });
});
