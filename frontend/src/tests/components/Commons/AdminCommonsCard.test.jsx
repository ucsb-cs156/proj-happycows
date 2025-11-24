import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminCommonsCard from "main/components/Commons/AdminCommonsCard";
import commonsPlusFixtures from "fixtures/commonsPlusFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { vi } from "vitest";
import "@testing-library/jest-dom";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("AdminCommonsCard tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockedNavigate.mockClear();
    mockToast.mockClear();
  });

  test("renders without crashing for admin user", () => {
    const queryClient = new QueryClient();
    const commonItem = commonsPlusFixtures.threeCommonsPlus[0];
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("AdminCommonsCard-1")).toBeInTheDocument();
  });

  test("returns null for non-admin user", () => {
    const queryClient = new QueryClient();
    const commonItem = commonsPlusFixtures.threeCommonsPlus[0];
    const currentUser = currentUserFixtures.userOnly;

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(container.firstChild).toBeNull();
  });

  test("displays all commons fields correctly", () => {
    const queryClient = new QueryClient();
    const commonItem = commonsPlusFixtures.threeCommonsPlus[0];
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText("com (ID: 1)")).toBeInTheDocument();
    expect(screen.getByText("Cow Price:")).toBeInTheDocument();
    expect(screen.getByText("Milk Price:")).toBeInTheDocument();
    expect(screen.getByText("Start Balance:")).toBeInTheDocument();
    expect(screen.getByText("Starting Date:")).toBeInTheDocument();
    expect(screen.getByText("Last Date:")).toBeInTheDocument();
    expect(screen.getByText("Degrad Rate:")).toBeInTheDocument();
    expect(screen.getByText("Show Leaderboard:")).toBeInTheDocument();
    expect(screen.getByText("Show Chat:")).toBeInTheDocument();
    expect(screen.getByText("Total Cows:")).toBeInTheDocument();
    expect(screen.getByText("Cap / User:")).toBeInTheDocument();
    expect(screen.getByText("Carry Cap:")).toBeInTheDocument();
    expect(screen.getByText("Eff Cap:")).toBeInTheDocument();

    const cowPriceLabel = screen.getByText("Cow Price:");
    const cowPriceValue = cowPriceLabel.parentElement.nextElementSibling;
    expect(cowPriceValue).toHaveTextContent("1");
    const milkPriceLabel = screen.getByText("Milk Price:");
    const milkPriceValue = milkPriceLabel.parentElement.nextElementSibling;
    expect(milkPriceValue).toHaveTextContent("1");
    const startBalanceLabel = screen.getByText("Start Balance:");
    const startBalanceValue = startBalanceLabel.parentElement.nextElementSibling;
    expect(startBalanceValue).toHaveTextContent("10");
    const startingDateLabel = screen.getByText("Starting Date:");
    const startingDateValue = startingDateLabel.parentElement.nextElementSibling;
    expect(startingDateValue).toHaveTextContent("2022-11-22");
    const lastDateLabel = screen.getByText("Last Date:");
    const lastDateValue = lastDateLabel.parentElement.nextElementSibling;
    expect(lastDateValue).toHaveTextContent("2022-11-22");
    const degradationRateLabel = screen.getByText("Degrad Rate:");
    const degradationRateValue = degradationRateLabel.parentElement.nextElementSibling;
    expect(degradationRateValue).toHaveTextContent("0.01");
    const showLeaderboardLabel = screen.getByText("Show Leaderboard:");
    const showLeaderboardValue = showLeaderboardLabel.parentElement.nextElementSibling;
    expect(showLeaderboardValue).toHaveTextContent("false");
    const showChatLabel = screen.getByText("Show Chat:");
    const showChatValue = showChatLabel.parentElement.nextElementSibling;
    expect(showChatValue).toHaveTextContent("false");
    const totalCowsLabel = screen.getByText("Total Cows:");
    const totalCowsValue = totalCowsLabel.parentElement.nextElementSibling;
    expect(totalCowsValue).toHaveTextContent("10");
    const capacityPerUserLabel = screen.getByText("Cap / User:");
    const capacityPerUserValue = capacityPerUserLabel.parentElement.nextElementSibling;
    expect(capacityPerUserValue).toHaveTextContent("50");
    const carryingCapacityLabel = screen.getByText("Carry Cap:");
    const carryingCapacityValue = carryingCapacityLabel.parentElement.nextElementSibling;
    expect(carryingCapacityValue).toHaveTextContent("100");
    const effectiveCapacityLabel = screen.getByText("Eff Cap:");
    const effectiveCapacityValue = effectiveCapacityLabel.parentElement.nextElementSibling;
    expect(effectiveCapacityValue).toHaveTextContent("100");
  });

  test("displays true values for showLeaderboard and showChat", () => {
    const queryClient = new QueryClient();
    const commonItem = commonsPlusFixtures.threeCommonsPlus[1];
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const trueValues = screen.getAllByText("true");
    expect(trueValues.length).toBeGreaterThanOrEqual(2);
  });

  test("displays default values for undefined totalCows and effectiveCapacity", () => {
    const queryClient = new QueryClient();
    const commonItem = {
      ...commonsPlusFixtures.threeCommonsPlus[0],
      totalCows: undefined,
      effectiveCapacity: undefined,
    };
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const zeroValues = screen.getAllByText("0");
    expect(zeroValues.length).toBeGreaterThanOrEqual(2);
  });

  test("formatDate formats date string correctly", () => {
    const queryClient = new QueryClient();
    const commonItem = {
      ...commonsPlusFixtures.threeCommonsPlus[0],
      commons: {
        ...commonsPlusFixtures.threeCommonsPlus[0].commons,
        startingDate: "2022-11-22T21:23:45",
        lastDate: "2022-12-25T10:30:00",
      },
    };
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText("2022-11-22")).toBeInTheDocument();
    expect(screen.getByText("2022-12-25")).toBeInTheDocument();
  });

  test("modal starts closed", () => {
    const queryClient = new QueryClient();
    const commonItem = commonsPlusFixtures.threeCommonsPlus[0];
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.queryByTestId("AdminCommonsCard-Modal-1"),
    ).not.toBeInTheDocument();
  });

  test("delete button opens modal", async () => {
    const queryClient = new QueryClient();
    const commonItem = commonsPlusFixtures.threeCommonsPlus[0];
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = screen.getByTestId("AdminCommonsCard-Delete-1");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(
        screen.getByTestId("AdminCommonsCard-Modal-1"),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete this commons?"),
    ).toBeInTheDocument();
  });

  test("modal cancel button closes modal", async () => {
    const queryClient = new QueryClient();
    const commonItem = commonsPlusFixtures.threeCommonsPlus[0];
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = screen.getByTestId("AdminCommonsCard-Delete-1");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(
        screen.getByTestId("AdminCommonsCard-Modal-1"),
      ).toBeInTheDocument();
    });

    const cancelButton = screen.getByTestId(
      "AdminCommonsCard-Modal-Cancel-1",
    );
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByTestId("AdminCommonsCard-Modal-1"),
      ).not.toBeInTheDocument();
    });
  });

  test("modal delete button confirms deletion", async () => {
    const queryClient = new QueryClient();
    const commonItem = commonsPlusFixtures.threeCommonsPlus[0];
    const currentUser = currentUserFixtures.adminUser;

    axiosMock.onDelete("/api/commons", { params: { id: 1 } }).reply(200, "Commons with id 1 was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = screen.getByTestId("AdminCommonsCard-Delete-1");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(
        screen.getByTestId("AdminCommonsCard-Modal-Delete-1"),
      ).toBeInTheDocument();
    });

    const confirmDeleteButton = screen.getByTestId(
      "AdminCommonsCard-Modal-Delete-1",
    );
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("Commons with id 1 was deleted");
    });

    expect(axiosMock.history.delete.length).toBe(1);
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });

    await waitFor(() => {
      expect(
        screen.queryByTestId("AdminCommonsCard-Modal-1"),
      ).not.toBeInTheDocument();
    });
  });

  test("card hover state starts as false", () => {
    const queryClient = new QueryClient();
    const commonItem = commonsPlusFixtures.threeCommonsPlus[0];
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const card = screen.getByTestId("AdminCommonsCard-1");
    expect(card).toHaveStyle({ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" });
  });

  test("card has hover state", () => {
    const queryClient = new QueryClient();
    const commonItem = commonsPlusFixtures.threeCommonsPlus[0];
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const card = screen.getByTestId("AdminCommonsCard-1");
    
    expect(card).toHaveStyle({ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" });
    
    fireEvent.mouseEnter(card);
    expect(card).toHaveStyle({ boxShadow: "0 4px 8px rgba(0,0,0,0.17)" });
    
    fireEvent.mouseLeave(card);
    expect(card).toHaveStyle({ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" });
  });

  test("modal onHide closes modal when escape key is pressed", async () => {
    const queryClient = new QueryClient();
    const commonItem = commonsPlusFixtures.threeCommonsPlus[0];
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = screen.getByTestId("AdminCommonsCard-Delete-1");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(
        screen.getByTestId("AdminCommonsCard-Modal-1"),
      ).toBeInTheDocument();
    });

    fireEvent.keyDown(document, {
      key: "Escape",
      code: "Escape",
      keyCode: 27,
      charCode: 27,
    });

    await waitFor(() => {
      expect(
        screen.queryByTestId("AdminCommonsCard-Modal-1"),
      ).not.toBeInTheDocument();
    });
  });

  test("displays all button texts correctly", () => {
    const queryClient = new QueryClient();
    const commonItem = commonsPlusFixtures.threeCommonsPlus[0];
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Leaderboard")).toBeInTheDocument();
    expect(screen.getByText("Stats CSV")).toBeInTheDocument();
    expect(screen.getByText("Announcements")).toBeInTheDocument();
  });

  test("displays all field labels correctly", () => {
    const queryClient = new QueryClient();
    const commonItem = commonsPlusFixtures.threeCommonsPlus[0];
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText("Cow Price:")).toBeInTheDocument();
    expect(screen.getByText("Milk Price:")).toBeInTheDocument();
    expect(screen.getByText("Start Balance:")).toBeInTheDocument();
    expect(screen.getByText("Starting Date:")).toBeInTheDocument();
    expect(screen.getByText("Last Date:")).toBeInTheDocument();
    expect(screen.getByText("Degrad Rate:")).toBeInTheDocument();
    expect(screen.getByText("Show Leaderboard:")).toBeInTheDocument();
    expect(screen.getByText("Show Chat:")).toBeInTheDocument();
    expect(screen.getByText("Total Cows:")).toBeInTheDocument();
    expect(screen.getByText("Cap / User:")).toBeInTheDocument();
    expect(screen.getByText("Carry Cap:")).toBeInTheDocument();
    expect(screen.getByText("Eff Cap:")).toBeInTheDocument();
  });

  test("works with different commons ID", () => {
    const queryClient = new QueryClient();
    const commonItem = commonsPlusFixtures.threeCommonsPlus[2];
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("AdminCommonsCard-3")).toBeInTheDocument();
    expect(screen.getByText("Not DLG (ID: 3)")).toBeInTheDocument();
  });

  test("formatDate handles different date string formats", () => {
    const queryClient = new QueryClient();
    const commonItem = {
      ...commonsPlusFixtures.threeCommonsPlus[0],
      commons: {
        ...commonsPlusFixtures.threeCommonsPlus[0].commons,
        startingDate: "2023-01-15T00:00:00.000Z",
        lastDate: "2023-12-31T23:59:59.999Z",
      },
    };
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText("2023-01-15")).toBeInTheDocument();
    expect(screen.getByText("2023-12-31")).toBeInTheDocument();
  });

  test("formatDate handles date string with String conversion", () => {
    const queryClient = new QueryClient();
    const commonItem = {
      ...commonsPlusFixtures.threeCommonsPlus[0],
      commons: {
        ...commonsPlusFixtures.threeCommonsPlus[0].commons,
        startingDate: 1672531200000,
        lastDate: "2023-01-01",
      },
    };
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const startingDateLabel = screen.getByText("Starting Date:");
    const startingDateElement = startingDateLabel.parentElement.nextElementSibling;
    expect(startingDateElement).toBeInTheDocument();
  });

  test("handles zero values correctly", () => {
    const queryClient = new QueryClient();
    const commonItem = {
      ...commonsPlusFixtures.threeCommonsPlus[1],
      effectiveCapacity: 0,
    };
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const zeroValues = screen.getAllByText("0");
    expect(zeroValues.length).toBeGreaterThanOrEqual(2);
  });

  test("modal shows correct button texts", async () => {
    const queryClient = new QueryClient();
    const commonItem = commonsPlusFixtures.threeCommonsPlus[0];
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCommonsCard commonItem={commonItem} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = screen.getByTestId("AdminCommonsCard-Delete-1");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(
        screen.getByTestId("AdminCommonsCard-Modal-1"),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Keep this Commons")).toBeInTheDocument();
    expect(screen.getByText("Permanently Delete")).toBeInTheDocument();
  });
});

