import { render, screen, fireEvent } from "@testing-library/react";
import TimeSeries from "main/components/Utils/TimeSeries";

describe("TimeSeries component", () => {
  const sampleSeries = [
    {
      name: "Wealth",
      color: "#ff0000",
      values: [
        { date: "2024-01-01T00:00:00.000Z", value: 5 },
        { date: "2024-01-02T00:00:00.000Z", value: 8 },
      ],
    },
    {
      name: "Population",
      color: "#0000ff",
      values: [
        { date: "2024-01-01T00:00:00.000Z", value: 3 },
        { date: "2024-01-03T00:00:00.000Z", value: 6 },
      ],
    },
  ];

  test("renders empty state when data is empty", () => {
    render(<TimeSeries data={[]} />);
    expect(screen.getByTestId("time-series-empty")).toBeInTheDocument();
    expect(screen.getByText("No data to display")).toBeInTheDocument();
  });

  test("renders empty state when data contains no plottable points", () => {
    render(
      <TimeSeries
        data={[
          {
            name: "Invalid",
            color: "#123456",
            values: [{ date: "bad-date", value: "x" }],
          },
        ]}
      />,
    );

    expect(screen.getByTestId("time-series-empty")).toBeInTheDocument();
  });

  test("renders chart and legend labels for valid data", () => {
    const { container } = render(<TimeSeries data={sampleSeries} />);

    expect(screen.getByTestId("time-series")).toBeInTheDocument();
    expect(screen.getByText("Wealth")).toBeInTheDocument();
    expect(screen.getByText("Population")).toBeInTheDocument();

    expect(
      container.querySelector("path.recharts-line-curve"),
    ).toBeInTheDocument();
  });

  test("uses custom width and height", () => {
    render(<TimeSeries data={sampleSeries} width={700} height={500} />);
    const svg = screen.getByTestId("time-series");

    expect(svg).toHaveAttribute("width", "700");
    expect(svg).toHaveAttribute("height", "500");
  });

  test("handles equal x and y ranges", () => {
    const onePointSeries = [
      {
        name: "OnlyPoint",
        color: "#00ff00",
        values: [{ date: "2024-01-01T00:00:00.000Z", value: 10 }],
      },
    ];

    render(<TimeSeries data={onePointSeries} />);

    expect(screen.getByTestId("time-series")).toBeInTheDocument();
    expect(screen.getByText("OnlyPoint")).toBeInTheDocument();
  });

  test("renders percentage axis labels when a percentage series is present", () => {
    render(
      <TimeSeries
        data={[
          ...sampleSeries,
          {
            name: "Health",
            color: "#00aa00",
            percentage: true,
            values: [
              { date: "2024-01-01T00:00:00.000Z", value: 25 },
              { date: "2024-01-03T00:00:00.000Z", value: 75 },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("Health")).toBeInTheDocument();
    expect(screen.getAllByText("0%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("100%").length).toBeGreaterThan(0);
  });

  test("renders percentage-only data using the percentage scale", () => {
    render(
      <TimeSeries
        data={[
          {
            name: "Health",
            color: "#00aa00",
            percentage: true,
            values: [
              { date: "2024-01-01T00:00:00.000Z", value: 0 },
              { date: "2024-01-02T00:00:00.000Z", value: 100 },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByTestId("time-series")).toBeInTheDocument();
    expect(screen.getByText("Health")).toBeInTheDocument();
    expect(screen.getAllByText("0%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("100%").length).toBeGreaterThan(0);
  });

  test("renders selector checkboxes only for matching series names", () => {
    render(
      <TimeSeries
        data={sampleSeries}
        selectors={["Wealth", "Missing Series", "Population"]}
      />,
    );

    expect(screen.getByTestId("time-series-selectors")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", {
        name: "Wealth",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", {
        name: "Population",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", {
        name: "Missing Series",
      }),
    ).not.toBeInTheDocument();
  });

  test("supports the all selector option", () => {
    render(<TimeSeries data={sampleSeries} selectors="all" />);

    const selectors = screen.getByTestId("time-series-selectors");
    expect(selectors).toBeInTheDocument();
    expect(selectors).toHaveClass(
      "d-flex",
      "justify-content-center",
      "flex-wrap",
      "gap-3",
    );
    expect(
      screen.getByRole("checkbox", { name: "Wealth" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Population" }),
    ).toBeInTheDocument();
  });

  test("supports a single selector name string", () => {
    const { container } = render(
      <TimeSeries data={sampleSeries} selectors="Wealth" />,
    );

    const selectors = screen.getByTestId("time-series-selectors");
    expect(
      screen.getByTestId("time-series").compareDocumentPosition(selectors),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(selectors).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Wealth" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "Population" }),
    ).not.toBeInTheDocument();
    expect(container.querySelectorAll("path.recharts-line-curve")).toHaveLength(
      2,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Wealth" }));
    expect(screen.getByTestId("time-series")).toBeInTheDocument();
    expect(container.querySelectorAll("path.recharts-line-curve")).toHaveLength(
      1,
    );
    expect(screen.queryByText("No data to display")).not.toBeInTheDocument();
  });

  test("matches checkbox label colors to the series colors", () => {
    render(<TimeSeries data={sampleSeries} selectors="all" />);

    const wealthLabel = screen
      .getByTestId("time-series-selector-wealth-wrapper")
      .querySelector("label span");
    const populationLabel = screen
      .getByTestId("time-series-selector-population-wrapper")
      .querySelector("label span");

    expect(wealthLabel).toHaveStyle({ color: "rgb(255, 0, 0)" });
    expect(populationLabel).toHaveStyle({ color: "rgb(0, 0, 255)" });
  });

  test("toggles selected series on and off with selector checkboxes", () => {
    const { container } = render(
      <TimeSeries data={sampleSeries} selectors={["Wealth", "Population"]} />,
    );

    const populationToggle = screen.getByRole("checkbox", {
      name: "Population",
    });
    const wealthToggle = screen.getByRole("checkbox", { name: "Wealth" });

    expect(populationToggle).toBeChecked();
    expect(wealthToggle).toBeChecked();
    expect(container.querySelectorAll("path.recharts-line-curve")).toHaveLength(
      2,
    );

    fireEvent.click(populationToggle);
    expect(container.querySelectorAll("path.recharts-line-curve")).toHaveLength(
      1,
    );
    expect(populationToggle).not.toBeChecked();

    fireEvent.click(wealthToggle);
    expect(screen.getByTestId("time-series-empty")).toBeInTheDocument();

    fireEvent.click(populationToggle);
    expect(screen.getByTestId("time-series")).toBeInTheDocument();
    expect(container.querySelectorAll("path.recharts-line-curve")).toHaveLength(
      1,
    );
  });
});
