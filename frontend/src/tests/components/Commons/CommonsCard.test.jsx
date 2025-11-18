import { fireEvent, render, screen } from "@testing-library/react";
import CommonsCard from "main/components/Commons/CommonsCard";
import { isFutureDate } from "main/components/Commons/commonsCardUtils";
import commonsFixtures from "fixtures/commonsFixtures";
import { vi } from "vitest";
import "@testing-library/jest-dom";

const curr = new Date();

describe("CommonsCard tests", () => {
  describe("isFutureDate", () => {
    const referenceDate = new Date(2025, 4, 15); // May 15, 2025

    it("returns true when target date is after reference", () => {
      expect(isFutureDate("2025-06-01", referenceDate)).toBe(true);
    });

    it("returns false when target date equals reference", () => {
      expect(isFutureDate("2025-05-15", referenceDate)).toBe(false);
    });

    it("returns false when target date is before reference", () => {
      expect(isFutureDate("2025-04-20", referenceDate)).toBe(false);
    });

    it("returns false when starting date is missing", () => {
      expect(isFutureDate(null, referenceDate)).toBe(false);
    });

    it("treats ISO strings with time component as the same calendar day", () => {
      expect(isFutureDate("2025-05-15T23:59:59Z", referenceDate)).toBe(false);
    });

    it("handles single digit days correctly when comparing", () => {
      const earlyMay = new Date(2025, 4, 5);
      expect(isFutureDate(earlyMay, referenceDate)).toBe(false);
    });

    it("returns false when current date is missing", () => {
      expect(isFutureDate("2025-01-01", null)).toBe(false);
    });
  });

  test("renders without crashing when button text is set", async () => {
    const click = vi.fn();
    render(
      <CommonsCard
        commons={commonsFixtures.threeCommons[0]}
        buttonText={"Join"}
        buttonLink={click}
      />,
    );

    const button = screen.getByTestId("commonsCard-button-Join-5");
    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
    fireEvent.click(button);
    expect(click).toBeCalledTimes(1);

    const name = screen.getByTestId("commonsCard-name-5");
    expect(name).toBeInTheDocument();
    expect(typeof name.textContent).toBe("string");
    expect(name.textContent).toEqual("Seths Common");

    const id = screen.getByTestId("commonsCard-id-5");
    expect(id).toBeInTheDocument();
    expect(typeof id.textContent).toBe("string");
    expect(id.textContent).toEqual("5");
  });

  test("renders no button when button text is null", () => {
    render(
      <CommonsCard
        commons={commonsFixtures.threeCommons[0]}
        buttonText={null}
      />,
    );

    expect(
      screen.queryByTestId(/commonsCard-button-\w+-5/),
    ).not.toBeInTheDocument();

    const name = screen.getByTestId("commonsCard-name-5");
    expect(name).toBeInTheDocument();
    expect(typeof name.textContent).toBe("string");
    expect(name.textContent).toEqual("Seths Common");

    const id = screen.getByTestId("commonsCard-id-5");
    expect(id).toBeInTheDocument();
    expect(typeof id.textContent).toBe("string");
    expect(id.textContent).toEqual("5");
  });

  test("cannot join commons with future start date - future year", async () => {
    const futureYearCommon = commonsFixtures.threeCommons[2];
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
      <CommonsCard
        commons={futureYearCommon}
        buttonText={"Join"}
        buttonLink={click}
      />,
    );

    const button = screen.getByTestId("commonsCard-button-Join-1");
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

  test("cannot join commons with future start date - future month", async () => {
    const futureCommon = commonsFixtures.threeCommons[2];
    futureCommon.startingDate = new Date(
      curr.getFullYear(),
      curr.getMonth() + 2,
      curr.getDate(),
    )
      .toISOString()
      .substring(0, 10);
    const click = vi.fn();
    render(
      <CommonsCard
        commons={futureCommon}
        buttonText={"Join"}
        buttonLink={click}
      />,
    );

    const button = screen.getByTestId("commonsCard-button-Join-1");
    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
    fireEvent.click(button);
    expect(click).toBeCalledTimes(0);

    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
  });

  test("can join commons with past date - past month", async () => {
    const futureCommon = commonsFixtures.threeCommons[2];
    futureCommon.startingDate = new Date(
      curr.getFullYear(),
      curr.getMonth() - 1,
      curr.getDate(),
    )
      .toISOString()
      .substring(0, 10);
    const click = vi.fn();
    render(
      <CommonsCard
        commons={futureCommon}
        buttonText={"Join"}
        buttonLink={click}
      />,
    );

    const button = screen.getByTestId("commonsCard-button-Join-1");
    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
    fireEvent.click(button);
    expect(click).toBeCalledTimes(1);
  });

  test("can visit even if wrong future date", async () => {
    const futureCommon = commonsFixtures.threeCommons[2];
    futureCommon.startingDate = new Date(
      curr.getFullYear(),
      curr.getMonth() + 2,
      curr.getDate(),
    )
      .toISOString()
      .substring(0, 10);
    const click = vi.fn();
    render(
      <CommonsCard
        commons={futureCommon}
        buttonText={"Visit"}
        buttonLink={click}
      />,
    );

    const button = screen.getByTestId("commonsCard-button-Visit-1");
    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Visit");
    fireEvent.click(button);
    expect(click).toBeCalledTimes(1);
  });

  test("cannot join commons with future start date - future day", async () => {
    const futureCommon = commonsFixtures.threeCommons[2];
    futureCommon.startingDate = new Date(
      curr.getFullYear(),
      curr.getMonth(),
      curr.getDate() + 1,
    )
      .toISOString()
      .substring(0, 10);
    const click = vi.fn();
    render(
      <CommonsCard
        commons={futureCommon}
        buttonText={"Join"}
        buttonLink={click}
      />,
    );

    const button = screen.getByTestId("commonsCard-button-Join-1");
    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
    fireEvent.click(button);
    expect(click).toBeCalledTimes(0);

    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
  });

  test("can join commons with current date", async () => {
    const futureCommon = commonsFixtures.threeCommons[2];
    futureCommon.startingDate = new Date(
      curr.getFullYear(),
      curr.getMonth(),
      curr.getDate(),
    )
      .toISOString()
      .substring(0, 10);
    const click = vi.fn();
    render(
      <CommonsCard
        commons={futureCommon}
        buttonText={"Join"}
        buttonLink={click}
      />,
    );

    const button = screen.getByTestId("commonsCard-button-Join-1");
    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
    fireEvent.click(button);
    expect(click).toBeCalledTimes(1);
  });

  test("can join commons with past start date", async () => {
    const click = vi.fn();
    render(
      <CommonsCard
        commons={commonsFixtures.threeCommons[0]}
        buttonText={"Join"}
        buttonLink={click}
      />,
    );

    const button = screen.getByTestId("commonsCard-button-Join-5");
    expect(button).toBeInTheDocument();
    expect(typeof button.textContent).toBe("string");
    expect(button.textContent).toEqual("Join");
    fireEvent.click(button);
    expect(click).toBeCalledTimes(1);
  });
});
