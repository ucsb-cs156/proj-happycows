import { render, screen } from "@testing-library/react";
import GameList from "main/components/Game/GameList";
import gameFixtures from "fixtures/gameFixtures";

describe("GameList tests", () => {
  test("renders without crashing when button text is set", () => {
    render(
      <GameList
        commonList={gameFixtures.threeGame}
        buttonText={"Join"}
        title="Join A New Game"
      />,
    );

    const title = screen.getByTestId("gameList-title");
    expect(title).toBeInTheDocument();
    expect(typeof title.textContent).toBe("string");
    expect(title.textContent).toEqual("Join A New Game");

    const subtitle_name = screen.getByTestId("gameList-subtitle-name");
    expect(subtitle_name).toBeInTheDocument();
    expect(typeof subtitle_name.textContent).toBe("string");
    expect(subtitle_name.textContent).toEqual("Game Name");

    const subtitle_id = screen.getByTestId("gameList-subtitle-id");
    expect(subtitle_id).toBeInTheDocument();
    expect(typeof subtitle_id.textContent).toBe("string");
    expect(subtitle_id.textContent).toEqual("ID#");

    const buttons = screen.getAllByTestId(/gameCard-button/);
    buttons.forEach((b) => {
      expect(b).toBeInTheDocument();
      expect(typeof b.textContent).toBe("string");
      expect(b.textContent).toEqual("Join");
    });

    let i = 0;
    const names = screen.getAllByTestId(/gameCard-name/);
    names.forEach((n) => {
      expect(n).toBeInTheDocument();
      expect(typeof n.textContent).toBe("string");
      expect(n.textContent).toEqual(gameFixtures.threeGame[i].name);
      i++;
    });

    i = 0;
    const ids = screen.getAllByTestId(/gameCard-id/);
    ids.forEach((id) => {
      expect(id).toBeInTheDocument();
      expect(typeof id.textContent).toBe("string");
      expect(id.textContent).toEqual(gameFixtures.threeGame[i].id.toString());
      i++;
    });
  });

  test("renders no button when button text is null", () => {
    render(<GameList commonList={gameFixtures.threeGame} buttonText={null} />);

    const title = screen.getByTestId("gameList-title");
    expect(title).toBeInTheDocument();
    expect(typeof title.textContent).toBe("string");
    expect(title.textContent).toEqual("");

    const subtitle_name = screen.getByTestId("gameList-subtitle-name");
    expect(subtitle_name).toBeInTheDocument();
    expect(typeof subtitle_name.textContent).toBe("string");
    expect(subtitle_name.textContent).toEqual("Game Name");

    const subtitle_id = screen.getByTestId("gameList-subtitle-id");
    expect(subtitle_id).toBeInTheDocument();
    expect(typeof subtitle_id.textContent).toBe("string");
    expect(subtitle_id.textContent).toEqual("ID#");

    expect(() => screen.getAllByTestId(/gameCard-button/)).toThrow(
      "Unable to find an element",
    );

    let i = 0;
    const names = screen.getAllByTestId(/gameCard-name/);
    names.forEach((n) => {
      expect(n).toBeInTheDocument();
      expect(typeof n.textContent).toBe("string");
      expect(n.textContent).toEqual(gameFixtures.threeGame[i].name);
      i++;
    });

    i = 0;
    const ids = screen.getAllByTestId(/gameCard-id/);
    ids.forEach((id) => {
      expect(id).toBeInTheDocument();
      expect(typeof id.textContent).toBe("string");
      expect(id.textContent).toEqual(gameFixtures.threeGame[i].id.toString());
      i++;
    });
  });

  test("renders default join UI when there are no game", () => {
    render(
      <GameList commonList={[]} buttonText={"Join"} title="Join A New Game" />,
    );

    const title = screen.getByTestId("gameList-title");
    expect(title).toBeInTheDocument();
    expect(typeof title.textContent).toBe("string");
    expect(title.textContent).toEqual("Join A New Game");

    const subtitle_name = screen.getByTestId("gameList-default-message");
    expect(subtitle_name).toBeInTheDocument();
    expect(typeof subtitle_name.textContent).toBe("string");
    expect(subtitle_name.textContent).toEqual(
      "There are currently no games to join",
    );
    expect(subtitle_name).toHaveStyle("justify-content: center;");

    expect(() => screen.getByTestId("gameList-subtitle-name")).toThrow(
      "Unable to find an element",
    );
  });

  test("renders default visit UI when there are no game", () => {
    render(
      <GameList commonList={[]} buttonText={"Visit"} title="Visit A Game" />,
    );

    const title = screen.getByTestId("gameList-title");
    expect(title).toBeInTheDocument();
    expect(typeof title.textContent).toBe("string");
    expect(title.textContent).toEqual("Visit A Game");

    const subtitle_name = screen.getByTestId("gameList-default-message");
    expect(subtitle_name).toBeInTheDocument();
    expect(typeof subtitle_name.textContent).toBe("string");
    expect(subtitle_name.textContent).toEqual(
      "There are currently no games to visit",
    );
    expect(subtitle_name).toHaveStyle("justify-content: center;");

    expect(() => screen.getByTestId("gameList-subtitle-name")).toThrow(
      "Unable to find an element",
    );
  });
});
