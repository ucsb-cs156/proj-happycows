import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminListCommonsPageV2 from "main/pages/AdminListCommonPagev2";
import commonsPlusFixtures from "fixtures/commonsPlusFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { vi } from "vitest";

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

describe("AdminListCommonPageV2 tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "CommonsTable";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  test("shows empty state when no commons returned", async () => {
    setupUserOnly();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/commons/allplus").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonsPageV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("CommonsTable-empty"),
    ).toHaveTextContent("No commons available");
  });

  test("renders commons in card layout for admin", async () => {
    setupAdminUser();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/commons/allplus")
      .reply(200, commonsPlusFixtures.threeCommonsPlus);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonsPageV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId(`CommonsTable-card-0-field-commons.name`),
    ).toHaveTextContent("com");
    expect(
      screen.getByTestId(`CommonsTable-card-0-field-commons.id`),
    ).toHaveTextContent("1");
    expect(screen.getByText("Download All Stats")).toBeInTheDocument();
  });

  test("delete flow uses card action buttons", async () => {
    setupAdminUser();

    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/commons/allplus")
      .reply(200, commonsPlusFixtures.threeCommonsPlus);
    axiosMock
      .onDelete("/api/commons", { params: { id: 1 } })
      .reply(200, "Commons with id 1 was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonsPageV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = await screen.findByTestId(
      `${testId}-card-0-action-Delete`,
    );
    fireEvent.click(deleteButton);

    const modalDelete = await screen.findByTestId("CommonsTable-Modal-Delete");
    fireEvent.click(modalDelete);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("Commons with id 1 was deleted");
    });
  });

  test("card edit and leaderboard buttons navigate correctly", async () => {
    setupAdminUser();

    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/commons/allplus")
      .reply(200, commonsPlusFixtures.threeCommonsPlus);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminListCommonsPageV2 />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const editButton = await screen.findByTestId(
      `${testId}-card-0-action-Edit`,
    );
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith("/admin/editcommons/1");
    });

    const leaderboardButton = screen.getByTestId(
      `${testId}-card-0-action-Leaderboard`,
    );
    fireEvent.click(leaderboardButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith("/leaderboard/1");
    });
  });
});
