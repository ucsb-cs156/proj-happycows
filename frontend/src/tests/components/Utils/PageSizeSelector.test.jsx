import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PageSizeSelector from "main/components/Utils/PageSizeSelector";
import { describe, expect, test, vi } from "vitest";

const DEFAULT_PAGE_SIZE_OPTIONS = [20, 50, 100, 200, 500];

describe("PageSizeSelector component", () => {
  test("renders with label 'Page Size'", () => {
    render(<PageSizeSelector value={20} onChange={() => {}} />);
    expect(screen.getByText("Page Size")).toBeInTheDocument();
    expect(screen.getByTestId("page-size-selector")).toBeInTheDocument();
  });

  test("renders select with default testid", () => {
    render(<PageSizeSelector value={20} onChange={() => {}} />);
    expect(screen.getByTestId("page-size-selector")).toBeInTheDocument();
  });

  test("renders select with custom testid", () => {
    render(
      <PageSizeSelector
        value={20}
        onChange={() => {}}
        testid="custom-testid"
      />,
    );
    expect(screen.getByTestId("custom-testid")).toBeInTheDocument();
  });

  test("offers the expected default options: 20, 50, 100, 200, 500", () => {
    render(<PageSizeSelector value={20} onChange={() => {}} />);
    DEFAULT_PAGE_SIZE_OPTIONS.forEach((option) => {
      expect(
        screen.getByTestId(`page-size-selector-option-${option}`),
      ).toHaveTextContent(String(option));
    });
  });

  test("offers custom options when provided", () => {
    render(
      <PageSizeSelector value={5} onChange={() => {}} options={[5, 10, 15]} />,
    );
    [5, 10, 15].forEach((option) => {
      expect(
        screen.getByTestId(`page-size-selector-option-${option}`),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId("page-size-selector-option-20"),
    ).not.toBeInTheDocument();
  });

  test("displays the current value", () => {
    render(<PageSizeSelector value={100} onChange={() => {}} />);
    const select = screen.getByTestId("page-size-selector");
    expect(select).toHaveValue("100");
  });

  test("calls onChange with parsed integer when a new option is selected", () => {
    const onChange = vi.fn();
    render(<PageSizeSelector value={20} onChange={onChange} />);
    const select = screen.getByTestId("page-size-selector");
    fireEvent.change(select, { target: { value: "200" } });
    expect(onChange).toHaveBeenCalledWith(200);
  });

  test("label is associated with select via htmlFor/id", () => {
    render(<PageSizeSelector value={20} onChange={() => {}} />);
    const label = screen.getByText("Page Size");
    expect(label).toHaveAttribute("for", "pageSize");
    const select = screen.getByTestId("page-size-selector");
    expect(select).toHaveAttribute("id", "pageSize");
  });
});
