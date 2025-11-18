import React from "react";
import { render, screen } from "@testing-library/react";
import { HrefButtonColumn } from "main/components/OurTable";

describe("OurTable HrefButtonColumn", () => {
  it("renders a button with the correct href using commons.id", () => {
    const col = HrefButtonColumn("Link", "primary", "/foo/", "testid");
    // col.Cell is a React component expecting { cell }
    const FakeCell = col.Cell;
    const fakeCell = {
      row: {
        values: {
          "commons.id": 42,
        },
        index: 0,
      },
      column: { id: "Link" },
    };

    render(<FakeCell cell={fakeCell} />);

    const btn = screen.getByRole("button", { name: "Link" });
    expect(btn).toBeInTheDocument();
    // the href should contain the id
    expect(btn.getAttribute("href")).toContain("/foo/42");
  });
});
