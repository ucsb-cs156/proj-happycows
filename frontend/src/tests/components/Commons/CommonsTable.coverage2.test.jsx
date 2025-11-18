import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommonsTable from "main/components/Commons/CommonsTable";
import { QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { createTestQueryClient } from "tests/utils/testQueryClient";

// Helper to build a commonsPlus object
const makeCommonsPlus = (overrides = {}) => {
  const base = {
    commons: {
      id: 1,
      name: "C1",
      cowPrice: 100,
      milkPrice: 10,
      startingBalance: 1000,
      startingDate: "2020-01-01",
      lastDate: "2020-12-31",
      degradationRate: 1,
      capacityPerUser: 5,
      carryingCapacity: 50,
      showLeaderboard: false,
      showChat: false,
    },
    totalCows: 0,
    totalUsers: 0,
    effectiveCapacity: null,
  };
  return { ...base, ...overrides };
};

function renderTable(commons, currentUser = { authorities: ["ROLE_ADMIN"] }) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CommonsTable commons={commons} currentUser={currentUser} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CommonsTable comparator edge branches", () => {
  test("numeric-equal branch: sorting by cowPrice with equal numbers keeps original order", async () => {
    const commons = [
      makeCommonsPlus({
        commons: {
          ...makeCommonsPlus().commons,
          id: 11,
          name: "A",
          cowPrice: 42,
        },
      }),
      makeCommonsPlus({
        commons: {
          ...makeCommonsPlus().commons,
          id: 22,
          name: "B",
          cowPrice: 42,
        },
      }),
    ];

    renderTable(commons);

    // Ensure we're sorting by cowPrice
    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, ["commons.cowPrice"]);

    // When both values are equal, comparator should return 0 and preserve order
    const firstCard = await screen.findByTestId("CommonsTable-card-0-name");
    expect(firstCard).toHaveTextContent("A");
  });

  test("fallback string-compare branch: non-string, non-number values fall back to String() compare and respond to asc/desc", async () => {
    // Use showLeaderboard field (not in numericKeys). Provide custom objects
    // whose Number(...) is NaN but String(...) is distinct, to ensure we
    // execute the final fallback branch in the comparator.
    const objA = { toString: () => "aaa" };
    const objB = { toString: () => "bbb" };
    const commons = [
      makeCommonsPlus({
        commons: {
          ...makeCommonsPlus().commons,
          id: 101,
          name: "X",
          showLeaderboard: objA,
        },
      }),
      makeCommonsPlus({
        commons: {
          ...makeCommonsPlus().commons,
          id: 102,
          name: "Y",
          showLeaderboard: objB,
        },
      }),
    ];

    renderTable(commons);

    // select the fallback key
    const select = screen.getByTestId("CommonsTable-sort-select");
    await userEvent.selectOptions(select, ["commons.showLeaderboard"]);

    // default sortDirection is asc -> expect "aaa" before "bbb" -> X before Y
    const firstCard = await screen.findByTestId("CommonsTable-card-0-name");
    expect(firstCard).toHaveTextContent("X");

    // toggle direction to desc and check ordering flips
    const toggle = screen.getByTestId("CommonsTable-sort-direction-toggle");
    await userEvent.click(toggle);

    const firstCardAfter = await screen.findByTestId(
      "CommonsTable-card-0-name",
    );
    expect(firstCardAfter).toHaveTextContent("Y");
  });
});
