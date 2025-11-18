import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import OurTable from "main/components/OurTable";

describe("OurTable extra edge branches (empty data but forced pagination)", () => {
  const columns = [{ Header: "Column 1", accessor: "col1" }];

  test("pagination renders with empty data when pageSize < 0; Next disabled due to rows.length === 0", async () => {
    render(<OurTable columns={columns} data={[]} pageSize={-1} />);

    // Pagination should render despite empty data
    expect(
      await screen.findByTestId("testid-prev-page-button"),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("testid-next-page-button"),
    ).toBeInTheDocument();

    // The <li> that contains the Next button should be disabled because rows.length === 0
    const items = screen.getAllByRole("listitem");
    const nextLi = items.find((li) => li.textContent?.includes("Next"));
    expect(nextLi).toHaveClass("disabled");

    // And Prev should also be disabled on the first page
    const prevLi = items.find((li) => li.textContent?.includes("Previous"));
    expect(prevLi).toHaveClass("disabled");
  });
});
