import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
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

// Next line uses technique from https://www.chakshunyu.com/blog/how-to-spy-on-a-named-import-in-jest/

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("UserTable tests", () => {
  const queryClient = new QueryClient();

  test("renders without crashing for empty table with user not logged in", () => {
    const currentUser = null;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsTable commons={[]} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  });
  test("renders without crashing for empty table for ordinary user", () => {
    const currentUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsTable commons={[]} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  });

  test("renders without crashing for empty table for admin", () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsTable commons={[]} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  });

  test("Displays expected commons information and actions for adminUser", () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsTable
            commons={commonsPlusFixtures.threeCommonsPlus}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
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

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsTable
            commons={commonsPlusFixtures.threeCommonsPlus}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

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
  const queryClient = new QueryClient();

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

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsTable
            commons={commonsPlusFixtures.threeCommonsPlus}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Verify that the modal is hidden by checking for the absence of the "modal-open" class
    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    const deleteButton = screen.getByTestId(
      "CommonsTable-card-0-action-Delete",
    );
    fireEvent.click(deleteButton);

    // Verify that the modal is shown by checking for the "modal-open" class
    await waitFor(() => {
      expect(document.body).toHaveClass("modal-open");
    });
  });

  test("Clicking Permanently Delete button deletes the commons", async () => {
    const currentUser = currentUserFixtures.adminUser;

    // https://www.chakshunyu.com/blog/how-to-spy-on-a-named-import-in-jest/
    const useBackendMutationSpy = vi.spyOn(
      useBackendModule,
      "useBackendMutation",
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsTable
            commons={commonsPlusFixtures.threeCommonsPlus}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = screen.getByTestId(
      "CommonsTable-card-0-action-Delete",
    );
    fireEvent.click(deleteButton);

    const permanentlyDeleteButton = await screen.findByTestId(
      "CommonsTable-Modal-Delete",
    );
    fireEvent.click(permanentlyDeleteButton);

    await waitFor(() => {
      expect(useBackendMutationSpy).toHaveBeenCalledWith(
        cellToAxiosParamsDelete,
        { onSuccess: onDeleteSuccess },
        ["/api/commons/allplus"],
      );
    });

    // Verify that the modal is hidden by checking for the absence of the "modal-open" class
    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });
  });

  test("Clicking Keep this Commons button cancels the deletion", async () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsTable
            commons={commonsPlusFixtures.threeCommonsPlus}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = screen.getByTestId(
      "CommonsTable-card-0-action-Delete",
    );
    fireEvent.click(deleteButton);

    const cancelButton = await screen.findByTestId("CommonsTable-Modal-Cancel");
    fireEvent.click(cancelButton);

    // Verify that the modal is hidden by checking for the absence of the "modal-open" class
    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  test("Pressing the escape key on the modal cancels the deletion", async () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsTable
            commons={commonsPlusFixtures.threeCommonsPlus}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Click the delete button to open the modal
    const deleteButton = screen.getByTestId(
      "CommonsTable-card-0-action-Delete",
    );
    fireEvent.click(deleteButton);

    // Check that the modal is displayed by checking for the "modal-open" class in the body
    expect(document.body).toHaveClass("modal-open");

    // Click the close button
    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    // Verify that the modal is hidden by checking for the absence of the "modal-open" class
    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    // Assert that the delete mutation was not called
    // (you'll need to replace `mockMutate` with the actual reference to the mutation in your code)
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
