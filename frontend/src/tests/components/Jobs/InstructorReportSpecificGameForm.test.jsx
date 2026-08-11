import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router";
import InstructorReportSpecificGameForm from "main/components/Jobs/InstructorReportSpecificGameForm";
import { QueryClient, QueryClientProvider } from "react-query";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import gameFixtures from "fixtures/gameFixtures";
import { vi } from "vitest";

// Next line uses technique from https://www.chakshunyu.com/blog/how-to-spy-on-a-named-import-in-jest/
import * as useBackendModule from "main/utils/useBackend";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("InstructorReportSpecificGameForm tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  it("renders the fallback text correctlyl", async () => {
    axiosMock.onGet("/api/game/all").reply(200, []);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <InstructorReportSpecificGameForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("There are no games on which to run this job."),
    ).toBeInTheDocument();
  });

  test("user can sucessfully submit the job", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockImplementation(() => null);

    const submitAction = vi.fn();
    axiosMock.onGet("/api/game/all").reply(200, gameFixtures.threeGame);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <InstructorReportSpecificGameForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );

    const gameRadio = await screen.findByTestId(
      "InstructorReportSpecificGameForm-game-1",
    );
    expect(gameRadio).toBeInTheDocument();
    fireEvent.click(gameRadio);

    expect(
      screen.queryByText("There are no games on which to run this job."),
    ).not.toBeInTheDocument();

    const submitButton = screen.getByTestId(
      "InstructorReportSpecificGameForm-Submit-Button",
    );

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    // assert - check that the console.log was called with the expected message
    await waitFor(() => {
      expect(submitAction).toHaveBeenCalled();
    });

    expect(submitAction).toHaveBeenCalledWith({
      selectedGame: 1,
      selectedGameName: "Anika's Game",
    });
  });

  test("the first item in game array is selected by default", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockImplementation((key) =>
      key === "InstructorReportSpecificGameForm-health" ? 42 : null,
    );

    axiosMock.onGet("/api/game/all").reply(200, gameFixtures.threeGame);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <InstructorReportSpecificGameForm />
        </Router>
      </QueryClientProvider>,
    );

    const defaultId = gameFixtures.threeGame[0].id;
    const testIdForFirstItem = `InstructorReportSpecificGameForm-game-${defaultId}`;
    await waitFor(() => {
      expect(screen.getByTestId(testIdForFirstItem)).toBeInTheDocument();
    });

    const game = screen.getByTestId(testIdForFirstItem);
    expect(game).toHaveAttribute("checked", "");
  });

  test("the correct parameters are passed to useBackend", async () => {
    // https://www.chakshunyu.com/blog/how-to-spy-on-a-named-import-in-jest/
    const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <InstructorReportSpecificGameForm />
        </Router>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(useBackendSpy).toHaveBeenCalledWith(
        ["/api/game/all"],
        { url: "/api/game/all" },
        [],
      );
    });
  });
});
