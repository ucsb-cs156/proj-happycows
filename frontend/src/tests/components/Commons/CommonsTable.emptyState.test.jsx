import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import CommonsTable from "main/components/Commons/CommonsTable";
import { QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { createTestQueryClient } from "tests/utils/testQueryClient";

describe("CommonsTable empty state", () => {
  function renderTable(commons = [], currentUser = { roles: [] }) {
    const queryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsTable commons={commons} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  test("renders empty alert when commons list is empty", () => {
    renderTable([]);
    const emptyAlert = screen.getByTestId("CommonsTable-empty");
    expect(emptyAlert).toBeInTheDocument();
    // Ensure no cards are rendered
    const anyCard = screen.queryByTestId(/CommonsTable-card-\d+/);
    expect(anyCard).toBeNull();
  });
});
