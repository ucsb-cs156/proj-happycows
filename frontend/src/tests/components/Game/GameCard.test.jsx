import { fireEvent, render, screen } from "@testing-library/react";
import GameCard from "main/components/Game/GameCard";
import { isFutureDate } from "main/components/Game/gameCardUtils";
import gameFixtures from "fixtures/gameFixtures";
import { vi } from "vitest";
import "@testing-library/jest-dom";

const curr = new Date();

describe("GameCard tests", () => {
  test("renders without crashing when button text is set", async () => {
    const click = vi.fn();
    render(
      <GameCard
        game={gameFixtures.threeGame[0]}
        buttonText={"Join"}
        buttonLink={click}
      />,
    );

    const button = screen.getByTestId("gameCard-button-Join-5");
    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
    fireEvent.click(button);
    expect(click).toBeCalledTimes(1);

    const name = screen.getByTestId("gameCard-name-5");
    expect(name).toBeInTheDocument();
    expect(typeof name.textContent).toBe("string");
    expect(name.textContent).toEqual("Seths Common");

    const id = screen.getByTestId("gameCard-id-5");
    expect(id).toBeInTheDocument();
    expect(typeof id.textContent).toBe("string");
    expect(id.textContent).toEqual("5");
  });

  test("renders no button when button text is null", () => {
    render(<GameCard game={gameFixtures.threeGame[0]} buttonText={null} />);

    expect(
      screen.queryByTestId(/gameCard-button-\w+-5/),
    ).not.toBeInTheDocument();

    const name = screen.getByTestId("gameCard-name-5");
    expect(name).toBeInTheDocument();
    expect(typeof name.textContent).toBe("string");
    expect(name.textContent).toEqual("Seths Common");

    const id = screen.getByTestId("gameCard-id-5");
    expect(id).toBeInTheDocument();
    expect(typeof id.textContent).toBe("string");
    expect(id.textContent).toEqual("5");
  });

  test("cannot join game with future start date - future year", async () => {
    const futureYearCommon = gameFixtures.threeGame[2];
    futureYearCommon.startingDate = new Date(
      curr.getFullYear() + 1,
      curr.getMonth(),
      curr.getDate(),
    )
      .toISOString()
      .substring(0, 10);
    const click = vi.fn();
    window.alert = vi.fn();
    render(
      <GameCard
        game={futureYearCommon}
        buttonText={"Join"}
        buttonLink={click}
      />,
    );

    const button = screen.getByTestId("gameCard-button-Join-1");
    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
    fireEvent.click(button);
    expect(click).toBeCalledTimes(0);
    expect(window.alert).toBeCalledTimes(1);

    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
  });

  test("cannot join game with future start date - future month", async () => {
    const futureCommon = gameFixtures.threeGame[2];
    futureCommon.startingDate = new Date(
      curr.getFullYear(),
      curr.getMonth() + 2,
      curr.getDate(),
    )
      .toISOString()
      .substring(0, 10);
    const click = vi.fn();
    render(
      <GameCard game={futureCommon} buttonText={"Join"} buttonLink={click} />,
    );

    const button = screen.getByTestId("gameCard-button-Join-1");
    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
    fireEvent.click(button);
    expect(click).toBeCalledTimes(0);

    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
  });

  test("can join game with past date - past month", async () => {
    const futureCommon = gameFixtures.threeGame[2];
    futureCommon.startingDate = new Date(
      curr.getFullYear(),
      curr.getMonth() - 1,
      curr.getDate(),
    )
      .toISOString()
      .substring(0, 10);
    const click = vi.fn();
    render(
      <GameCard game={futureCommon} buttonText={"Join"} buttonLink={click} />,
    );

    const button = screen.getByTestId("gameCard-button-Join-1");
    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
    fireEvent.click(button);
    expect(click).toBeCalledTimes(1);
  });

  test("can visit even if wrong future date", async () => {
    const futureCommon = gameFixtures.threeGame[2];
    futureCommon.startingDate = new Date(
      curr.getFullYear(),
      curr.getMonth() + 2,
      curr.getDate(),
    )
      .toISOString()
      .substring(0, 10);
    const click = vi.fn();
    render(
      <GameCard game={futureCommon} buttonText={"Visit"} buttonLink={click} />,
    );

    const button = screen.getByTestId("gameCard-button-Visit-1");
    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Visit");
    fireEvent.click(button);
    expect(click).toBeCalledTimes(1);
  });

  test("cannot join game with future start date - future day", async () => {
    const futureCommon = gameFixtures.threeGame[2];
    futureCommon.startingDate = new Date(
      curr.getFullYear(),
      curr.getMonth(),
      curr.getDate() + 1,
    )
      .toISOString()
      .substring(0, 10);
    const click = vi.fn();
    render(
      <GameCard game={futureCommon} buttonText={"Join"} buttonLink={click} />,
    );

    const button = screen.getByTestId("gameCard-button-Join-1");
    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
    fireEvent.click(button);
    expect(click).toBeCalledTimes(0);

    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
  });

  test("can join game with current date", async () => {
    const futureCommon = gameFixtures.threeGame[2];
    futureCommon.startingDate = new Date(
      curr.getFullYear(),
      curr.getMonth(),
      curr.getDate(),
    )
      .toISOString()
      .substring(0, 10);
    const click = vi.fn();
    render(
      <GameCard game={futureCommon} buttonText={"Join"} buttonLink={click} />,
    );

    const button = screen.getByTestId("gameCard-button-Join-1");
    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
    fireEvent.click(button);
    expect(click).toBeCalledTimes(1);
  });

  test("can join game with past start date", async () => {
    const click = vi.fn();
    render(
      <GameCard
        game={gameFixtures.threeGame[0]}
        buttonText={"Join"}
        buttonLink={click}
      />,
    );

    const button = screen.getByTestId("gameCard-button-Join-5");
    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
    fireEvent.click(button);
    expect(click).toBeCalledTimes(1);
  });
});

describe("isFutureDate helper", () => {
  const referenceDate = new Date("2024-05-15T12:00:00");

  test("detects future dates within the same month", () => {
    expect(isFutureDate("2024-05-16", referenceDate)).toBe(true);
    expect(isFutureDate("2024-05-15", referenceDate)).toBe(false);
  });

  test("detects future months and years", () => {
    expect(isFutureDate("2024-06-01", referenceDate)).toBe(true);
    expect(isFutureDate("2023-12-31", referenceDate)).toBe(false);
    expect(isFutureDate("2025-01-01", referenceDate)).toBe(true);
  });

  test("handles invalid or missing starting dates gracefully", () => {
    expect(isFutureDate(undefined, referenceDate)).toBe(false);
    expect(isFutureDate(null, referenceDate)).toBe(false);
    expect(isFutureDate("", referenceDate)).toBe(false);
    expect(isFutureDate("not-a-date", referenceDate)).toBe(false);
  });

  test("compares months correctly when they differ within the same year", () => {
    expect(isFutureDate("2024-04-01", referenceDate)).toBe(false);
    expect(isFutureDate("2024-07-01", referenceDate)).toBe(true);
  });

  test("parses ISO timestamps with time values", () => {
    expect(isFutureDate("2024-05-16T00:00:00Z", referenceDate)).toBe(true);
    expect(isFutureDate("2024-05-14T23:59:59Z", referenceDate)).toBe(false);
  });

  test("accepts reference dates supplied as strings", () => {
    expect(isFutureDate("2024-05-16", "2024-05-15")).toBe(true);
    expect(isFutureDate("2024-05-14", "2024-05-15")).toBe(false);
  });

  test("falls back to the current date when the reference is invalid", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-05-15T12:00:00Z"));
    const invalidReference = new Date("not-a-real-date");

    try {
      expect(isFutureDate("2024-05-16", invalidReference)).toBe(true);
      expect(isFutureDate("2024-05-14", invalidReference)).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
