import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { vi } from "vitest";

import AdminFarmerActivityPage from "main/pages/AdminFarmerActivityPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useParams: () => ({
    gameId: "1",
    userId: "2",
  }),
}));

describe("AdminFarmerActivityPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    axiosMock
      .onGet("/api/farmer", { params: { userId: "2", gameId: "1" } })
      .reply(200, { userId: 2, gameId: 1, username: "farmerjoe" });

    axiosMock
      .onGet("/api/game/plus", { params: { id: "1" } })
      .reply(200, { game: { id: 1, name: "Sample Game" }, totalPlayers: 5 });

    axiosMock
      .onGet("/api/farmeractivity/all", {
        params: { userId: "2", gameId: "1" },
      })
      .reply(200, []);
  });

  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminFarmerActivityPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("AdminFarmerActivityPage-title"),
    ).toBeInTheDocument();
  });

  test("shows the farmer's username and game name in the title", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminFarmerActivityPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("AdminFarmerActivityPage-title"),
      ).toHaveTextContent("Activity for farmerjoe in Sample Game");
    });
  });

  test("renders the FarmerActivityTable with the right gameId/userId", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminFarmerActivityPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("AdminFarmerActivityPage-table-page-size-selector"),
      ).toBeInTheDocument();
    });

    const activityCall = axiosMock.history.get.find(
      (call) => call.url === "/api/farmeractivity/all",
    );
    expect(activityCall.params).toEqual({ userId: "2", gameId: "1" });
  });

  test("does not crash when gamePlus has no game (e.g. before it loads)", async () => {
    axiosMock
      .onGet("/api/game/plus", { params: { id: "1" } })
      .reply(200, { totalPlayers: 5 });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminFarmerActivityPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("AdminFarmerActivityPage-title"),
    ).toHaveTextContent("Activity for farmerjoe in");
  });
});
