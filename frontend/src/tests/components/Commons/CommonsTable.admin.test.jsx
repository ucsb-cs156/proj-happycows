import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import CommonsTable from "main/components/Commons/CommonsTable";
import { vi } from "vitest";

// Mock useBackendMutation to avoid network calls
vi.mock("main/utils/useBackend", () => ({
  useBackendMutation: () => ({ mutate: vi.fn() }),
}));

// Minimal admin currentUser shape expected by hasRole
const adminUser = { loggedIn: true, root: { rolesList: ["ROLE_ADMIN"] } };

describe("CommonsTable admin actions", () => {
  const queryClient = new QueryClient();

  function renderTable(commons) {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsTable commons={commons} currentUser={adminUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  test("renders admin action buttons and modal open/close", async () => {
    const commons = [
      {
        commons: { id: 10, name: "AdminCommon", capacityPerUser: 2 },
        totalCows: 0,
        effectiveCapacity: 4,
      },
    ];

    renderTable(commons);

    // action buttons should be present
    expect(
      screen.getByTestId("CommonsTable-card-0-action-Edit"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("CommonsTable-card-0-action-Delete"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("CommonsTable-card-0-action-Leaderboard"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("CommonsTable-card-0-action-StatsCSV"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("CommonsTable-card-0-action-Announcements"),
    ).toBeInTheDocument();

    // open delete modal
    await userEvent.click(
      screen.getByTestId("CommonsTable-card-0-action-Delete"),
    );
    expect(screen.getByTestId("CommonsTable-Modal")).toBeVisible();

    // cancel should close modal
    await userEvent.click(screen.getByTestId("CommonsTable-Modal-Cancel"));
    // wait for the modal to be removed or hidden
    await waitFor(() => {
      const maybeModal = screen.queryByTestId("CommonsTable-Modal");
      // pass when modal is either gone or not visible
      if (maybeModal) {
        expect(maybeModal).not.toBeVisible();
      } else {
        expect(maybeModal).toBeNull();
      }
    });
  });
});
