import { render, screen } from "@testing-library/react";
import CountHistogram from "main/components/Utils/CountHistogram";

describe("CountHistogram component", () => {
  test("renders empty state when data is empty", () => {
    render(<CountHistogram data={[]} s={10} />);
    expect(screen.getByTestId("count-histogram-empty")).toBeInTheDocument();
  });

  test("renders empty state when data is null", () => {
    render(<CountHistogram data={null} s={10} />);
    expect(screen.getByTestId("count-histogram-empty")).toBeInTheDocument();
  });

  test("renders histogram SVG when data is provided", () => {
    const data = [1, 5, 10, 15, 20, 25];
    render(<CountHistogram data={data} s={10} />);
    expect(screen.getByTestId("count-histogram")).toBeInTheDocument();
  });

  test("calculates correct number of bins", () => {
    const data = [0, 5, 10, 15, 19];
    render(<CountHistogram data={data} s={10} />);
    // bins: 0-9, 10-19, so 2 bins total
    expect(screen.getByTestId("histogram-bar-0")).toBeInTheDocument();
    expect(screen.getByTestId("histogram-bar-1")).toBeInTheDocument();
    expect(screen.queryByTestId("histogram-bar-2")).not.toBeInTheDocument();
  });

  test("counts values correctly in bins", () => {
    const data = [0, 5, 10, 12, 15, 20];
    render(<CountHistogram data={data} s={10} />);
    // bar 0 (0-9): [0, 5] = 2 values
    // bar 1 (10-19): [10, 12, 15] = 3 values
    // bar 2 (20-29): [20] = 1 value
    expect(screen.getByTestId("histogram-bar-0")).toBeInTheDocument();
    expect(screen.getByTestId("histogram-bar-1")).toBeInTheDocument();
    expect(screen.getByTestId("histogram-bar-2")).toBeInTheDocument();
  });

  test("handles single value correctly", () => {
    const data = [7];
    render(<CountHistogram data={data} s={10} />);
    expect(screen.getByTestId("histogram-bar-0")).toBeInTheDocument();
  });

  test("handles values at bin boundaries", () => {
    const data = [0, 10, 20, 30];
    render(<CountHistogram data={data} s={10} />);
    // 0 is in bin 0 (0-9)
    // 10 is in bin 1 (10-19)
    // 20 is in bin 2 (20-29)
    // 30 is in bin 3 (30-39)
    expect(screen.getByTestId("histogram-bar-0")).toBeInTheDocument();
    expect(screen.getByTestId("histogram-bar-1")).toBeInTheDocument();
    expect(screen.getByTestId("histogram-bar-2")).toBeInTheDocument();
    expect(screen.getByTestId("histogram-bar-3")).toBeInTheDocument();
  });

  test("uses custom width and height", () => {
    const data = [1, 5, 10];
    render(<CountHistogram data={data} s={5} width={800} height={500} />);
    const svg = screen.getByTestId("count-histogram");
    expect(svg).toHaveAttribute("width", "800");
    expect(svg).toHaveAttribute("height", "500");
  });

  test("uses default width and height", () => {
    const data = [1, 5, 10];
    render(<CountHistogram data={data} s={5} />);
    const svg = screen.getByTestId("count-histogram");
    expect(svg).toHaveAttribute("width", "600");
    expect(svg).toHaveAttribute("height", "400");
  });

  test("handles large bin size", () => {
    const data = [5, 12, 18, 25, 32];
    render(<CountHistogram data={data} s={50} />);
    // All values fall into bin 0 (0-49)
    expect(screen.getByTestId("histogram-bar-0")).toBeInTheDocument();
  });

  test("handles bin size of 1", () => {
    const data = [0, 1, 2];
    render(<CountHistogram data={data} s={1} />);
    // Each value gets its own bin
    expect(screen.getByTestId("histogram-bar-0")).toBeInTheDocument();
    expect(screen.getByTestId("histogram-bar-1")).toBeInTheDocument();
    expect(screen.getByTestId("histogram-bar-2")).toBeInTheDocument();
  });

  test("handles duplicate values", () => {
    const data = [5, 5, 5, 15, 15];
    render(<CountHistogram data={data} s={10} />);
    // bin 0: [5, 5, 5] = 3 values
    // bin 1: [15, 15] = 2 values
    expect(screen.getByTestId("histogram-bar-0")).toBeInTheDocument();
    expect(screen.getByTestId("histogram-bar-1")).toBeInTheDocument();
  });

  test("handles all zeros", () => {
    const data = [0, 0, 0];
    render(<CountHistogram data={data} s={10} />);
    expect(screen.getByTestId("histogram-bar-0")).toBeInTheDocument();
  });
});
