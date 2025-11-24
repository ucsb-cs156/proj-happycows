import { fireEvent, render, screen } from "@testing-library/react";
import CommonsCard from "main/components/Commons/CommonsCard";
import commonsFixtures from "fixtures/commonsFixtures";
import { vi } from "vitest";
import "@testing-library/jest-dom";

const curr = new Date();

describe("CommonsCard tests", () => {
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

  test("can join commons with past date - past month same year", async () => {
    const pastCommon = commonsFixtures.threeCommons[2];
    const safeMonth = curr.getMonth() >= 6 ? 5 : 0;

    pastCommon.startingDate = new Date(
      curr.getFullYear(),
      safeMonth,
      curr.getDate() + 5,
    )
      .toISOString()
      .substring(0, 10);

    const click = vi.fn();

    render(
      <CommonsCard
        commons={pastCommon}
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

  test("cannot join commons with future start date - future month dame year", async () => {
    const futureCommon = commonsFixtures.threeCommons[2];

    if (curr.getMonth() === 11) {
      futureCommon.startingDate = new Date(
        curr.getFullYear(),
        curr.getMonth(),
        curr.getDate() + 1,
      )
        .toISOString()
        .substring(0, 10);
    } else {
      futureCommon.startingDate = new Date(
        curr.getFullYear(),
        curr.getMonth() + 1,
        curr.getDate(),
      )
        .toISOString()
        .substring(0, 10);
    }

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
    fireEvent.click(button);
    expect(click).toBeCalledTimes(0);
  });
});
