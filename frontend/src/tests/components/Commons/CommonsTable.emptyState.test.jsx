import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import CommonsTable from "main/components/Commons/CommonsTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";

describe("CommonsTable empty state", () => {
  const queryClient = new QueryClient();

  function renderTable(commons = [], currentUser = { roles: [] }) {
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
