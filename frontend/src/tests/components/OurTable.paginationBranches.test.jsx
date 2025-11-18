import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import OurTable from "main/components/OurTable";

describe("OurTable pagination branch coverage", () => {
  const columns = [{ Header: "C1", accessor: "col1" }];

  test("pageIndex=0 with pages=5 hits forward-three equality; right-ellipsis absent; last-page present", async () => {
    const data = Array.from({ length: 10 }).map((_, i) => ({ col1: `R${i}` })); // pageSize=2 => pages=5 (lastIndex=4)
    render(<OurTable columns={columns} data={data} pageSize={2} />);

    // Pagination should render
    expect(
      await screen.findByTestId("testid-next-page-button"),
    ).toBeInTheDocument();

    // forward-two and forward-three should be visible at index 0 when lastIndex === pageIndex + 4
    expect(
      screen.getByTestId("testid-forward-two-page-button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("testid-forward-three-page-button"),
    ).toBeInTheDocument();

    // Right ellipsis should NOT show on equality (only when strictly less)
    expect(screen.queryByTestId("testid-right-ellipsis")).toBeNull();

    // Last-page button should be visible (<= condition)
    expect(screen.getByTestId("testid-last-page-button")).toBeInTheDocument();
  });

  test("navigating to last page shows left ellipsis + first page; Next disabled via last-page branch; pageIndex=4 shows back-three", async () => {
    const data = Array.from({ length: 12 }).map((_, i) => ({ col1: `R${i}` })); // pageSize=2 => pages=6 (lastIndex=5)
    render(<OurTable columns={columns} data={data} pageSize={2} />);

    // At index 0: right ellipsis and last-page visible
    expect(
      await screen.findByTestId("testid-right-ellipsis"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("testid-last-page-button")).toBeInTheDocument();

    // Go to last page via the last-page button
    fireEvent.click(screen.getByTestId("testid-last-page-button"));

    // On last page: Next should be disabled due to pageIndex === lastIndex
    const items = screen.getAllByRole("listitem");
    const nextLi = items.find((li) => li.textContent?.includes("Next"));
    expect(nextLi).toHaveClass("disabled");

    // Left ellipsis and first page button should be present when pageIndex > 3 / > 4
    expect(screen.getByTestId("testid-left-ellipsis")).toBeInTheDocument();
    expect(screen.getByTestId("testid-first-page-button")).toBeInTheDocument();

    // Back-one and back-two should be present
    expect(
      screen.getByTestId("testid-back-one-page-button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("testid-back-two-page-button"),
    ).toBeInTheDocument();

    // Move back one page to index 4, which should reveal the back-three button
    fireEvent.click(screen.getByTestId("testid-back-one-page-button"));
    expect(
      screen.getByTestId("testid-back-three-page-button"),
    ).toBeInTheDocument();
  });
});
