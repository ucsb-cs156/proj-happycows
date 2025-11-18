import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import OurTable from "main/components/OurTable";

describe("OurTable initialState spread branch", () => {
  const data = Array.from({ length: 12 }).map((_, i) => ({ col1: `R${i}` }));
  const columns = [{ Header: "C1", accessor: "col1" }];

  test("includes initialState when provided (branch where && is truthy)", async () => {
    render(
      <OurTable
        columns={columns}
        data={data}
        // Provide initialState to exercise the `...(rest.initialState && { initialState: rest.initialState })` branch
        initialState={{ sortBy: [{ id: "col1", desc: false }] }}
      />,
    );

    // Basic smoke checks that table rendered and pagination appears (since 12 > default pageSize 10)
    expect(
      await screen.findByTestId("testid-next-page-button"),
    ).toBeInTheDocument();
    // click next to ensure interactive wiring still works
    fireEvent.click(screen.getByTestId("testid-next-page-button"));
  });
});
