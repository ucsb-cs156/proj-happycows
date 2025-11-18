import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import CommonsTable from "main/components/Commons/CommonsTable";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import commonsPlusFixtures from "fixtures/commonsPlusFixtures";
import * as useBackendModule from "main/utils/useBackend";
import { vi } from "vitest";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/commonsUtils";
import { createTestQueryClient } from "tests/utils/testQueryClient";

// Next line uses technique from https://www.chakshunyu.com/blog/how-to-spy-on-a-named-import-in-jest/

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

const renderCommonsTable = (props) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CommonsTable {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("UserTable tests", () => {
  test("renders without crashing for empty table with user not logged in", () => {
    const currentUser = null;

    renderCommonsTable({ commons: [], currentUser });
  });
  test("renders without crashing for empty table for ordinary user", () => {
    const currentUser = currentUserFixtures.userOnly;

    renderCommonsTable({ commons: [], currentUser });
  });

  test("renders without crashing for empty table for admin", () => {
    const currentUser = currentUserFixtures.adminUser;

    renderCommonsTable({ commons: [], currentUser });
  });

  test("Displays expected commons information and actions for adminUser", () => {
    const currentUser = currentUserFixtures.adminUser;

    renderCommonsTable({
      commons: commonsPlusFixtures.threeCommonsPlus,
      currentUser,
    });
    const cards = commonsPlusFixtures.threeCommonsPlus.map((_, index) =>
      screen.getByTestId(`CommonsTable-card-${index}`),
    );
    expect(cards.length).toEqual(commonsPlusFixtures.threeCommonsPlus.length);

    expect(
      screen.getByTestId("CommonsTable-card-0-field-commons.id"),
    ).toHaveTextContent("1");
    expect(
      screen.getByTestId("CommonsTable-card-1-field-commons.id"),
    ).toHaveTextContent("2");

    expect(screen.getByTestId("CommonsTable-card-1-name")).toHaveTextContent(
      "Com2",
    );
    expect(
      screen.getByTestId("CommonsTable-card-1-field-commons.cowPrice"),
    ).toHaveTextContent("1");
    expect(
      screen.getByTestId("CommonsTable-card-1-field-commons.milkPrice"),
    ).toHaveTextContent("2");
    expect(
      screen.getByTestId("CommonsTable-card-1-field-commons.degradationRate"),
    ).toHaveTextContent("0.01");
    expect(
      screen.getByTestId("CommonsTable-card-1-field-commons.capacityPerUser"),
    ).toHaveTextContent("5");
    expect(
      screen.getByTestId("CommonsTable-card-1-field-commons.carryingCapacity"),
    ).toHaveTextContent("42");
    expect(
      screen.getByTestId("CommonsTable-card-1-field-commons.startingBalance"),
    ).toHaveTextContent("10");
    expect(
      screen.getByTestId("CommonsTable-card-1-field-commons.startingDate"),
    ).toHaveTextContent("2022-11-22");
    expect(
      screen.getByTestId("CommonsTable-card-1-field-commons.lastDate"),
    ).toHaveTextContent("2022-11-22");
    expect(
      screen.getByTestId("CommonsTable-card-1-field-commons.showLeaderboard"),
    ).toHaveTextContent("true");
    expect(
      screen.getByTestId("CommonsTable-card-1-field-commons.showChat"),
    ).toHaveTextContent("true");
    expect(
      screen.getByTestId("CommonsTable-card-1-field-totalCows"),
    ).toHaveTextContent("0");
    expect(
      screen.getByTestId("CommonsTable-card-1-totalCows"),
    ).toHaveTextContent("Tot Cows: 0");
    expect(
      screen.getByTestId("CommonsTable-card-1-effectiveCapacity"),
    ).toHaveTextContent("Eff Cap: 42");
    expect(
      screen.getByTestId("CommonsTable-card-1-field-effectiveCapacity"),
    ).toHaveTextContent("42");

    expect(screen.getByTestId("CommonsTable-card-0-action-Edit")).toHaveClass(
      "btn-primary",
    );
    expect(screen.getByTestId("CommonsTable-card-0-action-Delete")).toHaveClass(
      "btn-danger",
    );
    expect(
      screen.getByTestId("CommonsTable-card-0-action-Leaderboard"),
    ).toHaveClass("btn-secondary");
    expect(
      screen.getByTestId("CommonsTable-card-0-action-StatsCSV"),
    ).toHaveClass("btn-success");
    expect(
      screen.getByTestId("CommonsTable-card-0-action-Announcements"),
    ).toHaveClass("btn-info");
  });

  test("allows sorting by Name descending", () => {
    const currentUser = currentUserFixtures.adminUser;

    renderCommonsTable({
      commons: commonsPlusFixtures.threeCommonsPlus,
      currentUser,
    });

    const sortSelect = screen.getByTestId("CommonsTable-sort-select");
    fireEvent.change(sortSelect, { target: { value: "commons.name" } });

    const directionToggle = screen.getByTestId(
      "CommonsTable-sort-direction-toggle",
    );
    fireEvent.click(directionToggle);

    expect(directionToggle).toHaveTextContent("Descending");
    expect(
      screen.getByTestId("CommonsTable-card-0-field-commons.id"),
    ).toHaveTextContent("3");
  });
});

describe("Modal tests", () => {
  // Mocking the delete mutation function
  const mockMutate = vi.fn();
  const mockUseBackendMutation = {
    mutate: mockMutate,
  };

  beforeEach(() => {
    vi.spyOn(useBackendModule, "useBackendMutation").mockReturnValue(
      mockUseBackendMutation,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Clicking Delete button opens the modal for adminUser", async () => {
    const currentUser = currentUserFixtures.adminUser;

    renderCommonsTable({
      commons: commonsPlusFixtures.threeCommonsPlus,
      currentUser,
    });

    const deleteButton = screen.getByTestId(
      "CommonsTable-card-0-action-Delete",
    );
    fireEvent.click(deleteButton);

    expect(screen.getByTestId("CommonsTable-Modal")).toBeInTheDocument();
  });

  test("Clicking Permanently Delete button deletes the commons", async () => {
    const currentUser = currentUserFixtures.adminUser;

    // https://www.chakshunyu.com/blog/how-to-spy-on-a-named-import-in-jest/
    const useBackendMutationSpy = vi.spyOn(
      useBackendModule,
      "useBackendMutation",
    );

    renderCommonsTable({
      commons: commonsPlusFixtures.threeCommonsPlus,
      currentUser,
    });

    const deleteButton = screen.getByTestId(
      "CommonsTable-card-0-action-Delete",
    );
    fireEvent.click(deleteButton);

    const permanentlyDeleteButton = await screen.findByTestId(
      "CommonsTable-Modal-Delete",
    );
    fireEvent.click(permanentlyDeleteButton);

    await waitFor(
      () => {
        expect(useBackendMutationSpy).toHaveBeenCalledWith(
          cellToAxiosParamsDelete,
          { onSuccess: onDeleteSuccess },
          ["/api/commons/allplus"],
        );
      },
      { timeout: 50 },
    );

    await waitFor(
      () => {
        const modal = screen.getByTestId("CommonsTable-Modal");
        expect(modal).not.toBeVisible();
      },
      { timeout: 50 },
    );
  });

  test("Clicking Keep this Commons button cancels the deletion", async () => {
    const currentUser = currentUserFixtures.adminUser;

    renderCommonsTable({
      commons: commonsPlusFixtures.threeCommonsPlus,
      currentUser,
    });

    const deleteButton = screen.getByTestId(
      "CommonsTable-card-0-action-Delete",
    );
    fireEvent.click(deleteButton);

    const cancelButton = await screen.findByTestId("CommonsTable-Modal-Cancel");
    fireEvent.click(cancelButton);

    await waitFor(
      () => {
        const modal = screen.getByTestId("CommonsTable-Modal");
        expect(modal).not.toBeVisible();
      },
      { timeout: 50 },
    );

    expect(mockMutate).not.toHaveBeenCalled();
  });

  test("Pressing the escape key on the modal cancels the deletion", async () => {
    const currentUser = currentUserFixtures.adminUser;

    renderCommonsTable({
      commons: commonsPlusFixtures.threeCommonsPlus,
      currentUser,
    });

    const deleteButton = screen.getByTestId(
      "CommonsTable-card-0-action-Delete",
    );
    fireEvent.click(deleteButton);

    expect(screen.getByTestId("CommonsTable-Modal")).toBeInTheDocument();

    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    await waitFor(
      () => {
        const modal = screen.getByTestId("CommonsTable-Modal");
        expect(modal).not.toBeVisible();
      },
      { timeout: 50 },
    );

    // Assert that the delete mutation was not called
    // (you'll need to replace `mockMutate` with the actual reference to the mutation in your code)
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
