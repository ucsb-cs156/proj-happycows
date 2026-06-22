import { render, screen } from "@testing-library/react";
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
});
