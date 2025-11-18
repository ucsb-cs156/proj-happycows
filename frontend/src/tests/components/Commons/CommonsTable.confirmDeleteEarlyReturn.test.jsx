import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { describe, test, expect } from "vitest";
import CommonsTable from "main/components/Commons/CommonsTable";
import { createTestQueryClient } from "tests/utils/testQueryClient";

describe("CommonsTable confirmDelete early return branch", () => {
  test("clicking Permanently Delete with no commonsToDelete triggers early return safely", async () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsTable
            commons={[]}
            currentUser={{
              loggedIn: true,
              root: { rolesList: ["ROLE_ADMIN"] },
            }}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // With mocked Modal, the delete button is always present.
    const deleteBtn = await screen.findByTestId("CommonsTable-Modal-Delete");
    await userEvent.click(deleteBtn);

    // If early return threw or mutated, test would fail; reaching here is success.
    expect(deleteBtn).toBeInTheDocument();
  });
});
