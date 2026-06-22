import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import BinSizeSelector from "main/components/Utils/BinSizeSelector";
import { describe, expect, test, vi } from "vitest";

describe("BinSizeSelector component", () => {
  test("renders with label 'Bin Size'", () => {
    render(<BinSizeSelector value={10} onChange={() => {}} />);
    expect(screen.getByText("Bin Size")).toBeInTheDocument();
    expect(screen.getByTestId("bin-size-selector")).toBeInTheDocument();
    expect(screen.getByTestId("bin-size-selector")).toHaveAttribute(
      "style",
      "width: 100px;",
    );
  });

  test("renders input with default testid", () => {
    render(<BinSizeSelector value={10} onChange={() => {}} />);
    expect(screen.getByTestId("bin-size-selector")).toBeInTheDocument();
  });

  test("renders input with custom testid", () => {
    render(
      <BinSizeSelector value={10} onChange={() => {}} testid="custom-testid" />,
    );
    expect(screen.getByTestId("custom-testid")).toBeInTheDocument();
  });

  test("displays the current value", () => {
    render(<BinSizeSelector value={15} onChange={() => {}} />);
    const input = screen.getByTestId("bin-size-selector");
    expect(input).toHaveValue(15);
  });

  test("displays the current value when the value is 1", () => {
    render(<BinSizeSelector value={11} onChange={() => {}} />);
    const input = screen.getByTestId("bin-size-selector");
    expect(input).toHaveValue(11);
  });

  test("has min attribute of 1", () => {
    render(<BinSizeSelector value={10} onChange={() => {}} />);
    const input = screen.getByTestId("bin-size-selector");
    expect(input).toHaveAttribute("min", "1");
  });

  test("has step attribute of 1 (integers only)", () => {
    render(<BinSizeSelector value={10} onChange={() => {}} />);
    const input = screen.getByTestId("bin-size-selector");
    expect(input).toHaveAttribute("step", "1");
  });

  test("has type number", () => {
    render(<BinSizeSelector value={10} onChange={() => {}} />);
    const input = screen.getByTestId("bin-size-selector");
    expect(input).toHaveAttribute("type", "number");
  });

  test("calls onChange with parsed integer when valid value entered", () => {
    const onChange = vi.fn();
    render(<BinSizeSelector value={10} onChange={onChange} />);
    const input = screen.getByTestId("bin-size-selector");
    fireEvent.change(input, { target: { value: "5" } });
    expect(onChange).toHaveBeenCalledWith(5);
  });

  test("calls onChange with parsed integer when 1 entered", () => {
    const onChange = vi.fn();
    render(<BinSizeSelector value={10} onChange={onChange} />);
    const input = screen.getByTestId("bin-size-selector");
    fireEvent.change(input, { target: { value: "1" } });
    expect(onChange).toHaveBeenCalledWith(1);
  });

  test("does not call onChange when value is less than 1", () => {
    const onChange = vi.fn();
    render(<BinSizeSelector value={10} onChange={onChange} />);
    const input = screen.getByTestId("bin-size-selector");
    fireEvent.change(input, { target: { value: "0" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  test("does not call onChange when value is not a number", () => {
    const onChange = vi.fn();
    render(<BinSizeSelector value={10} onChange={onChange} />);
    const input = screen.getByTestId("bin-size-selector");
    fireEvent.change(input, { target: { value: "abc" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  test("calls onChange with parsed integer for large values (no maximum)", () => {
    const onChange = vi.fn();
    render(<BinSizeSelector value={10} onChange={onChange} />);
    const input = screen.getByTestId("bin-size-selector");
    fireEvent.change(input, { target: { value: "1000" } });
    expect(onChange).toHaveBeenCalledWith(1000);
  });

  test("label is associated with input via htmlFor/id", () => {
    render(<BinSizeSelector value={10} onChange={() => {}} />);
    const label = screen.getByText("Bin Size");
    expect(label).toHaveAttribute("for", "binSize");
    const input = screen.getByTestId("bin-size-selector");
    expect(input).toHaveAttribute("id", "binSize");
  });
});
