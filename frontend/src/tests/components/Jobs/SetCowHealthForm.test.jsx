import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router";
import SetCowHealthForm from "main/components/Jobs/SetCowHealthForm";
import { QueryClient, QueryClientProvider } from "react-query";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import gameFixtures from "fixtures/gameFixtures";
import * as useBackendModule from "main/utils/useBackend";
import { vi } from "vitest";

// Next line uses technique from https://www.chakshunyu.com/blog/how-to-spy-on-a-named-import-in-jest/

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("SetCowHealthForm tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  it("renders the fallback text correctlyl", async () => {
    axiosMock.onGet("/api/game/all").reply(200, []);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <SetCowHealthForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("There are no games on which to run this job."),
    ).toBeInTheDocument();
  });

  it("validates health > 0", async () => {
    const submitAction = vi.fn();
    axiosMock.onGet("/api/game/all").reply(200, gameFixtures.threeGame);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <SetCowHealthForm />
        </Router>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("SetCowHealthForm-healthValue"),
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId("SetCowHealthForm-Submit-Button");
    const healthInput = screen.getByTestId("SetCowHealthForm-healthValue");

    expect(submitButton).toBeInTheDocument();
    expect(healthInput).toHaveValue(100);

    fireEvent.change(healthInput, { target: { value: "-1" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Health Value must be ≥ 0/i)).toBeInTheDocument();
    });
    expect(submitAction).not.toBeCalled();
  });

  it("validates health ≥ 0", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockImplementation(() => null);

    const submitAction = vi.fn();
    axiosMock.onGet("/api/game/all").reply(200, gameFixtures.threeGame);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <SetCowHealthForm />
        </Router>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("SetCowHealthForm-healthValue"),
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId("SetCowHealthForm-Submit-Button");
    const healthInput = screen.getByTestId("SetCowHealthForm-healthValue");

    expect(submitButton).toBeInTheDocument();
    expect(healthInput).toHaveValue(100);

    fireEvent.change(healthInput, { target: { value: "-1" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Health Value must be ≥ 0/i)).toBeInTheDocument();
    });
    expect(submitAction).not.toBeCalled();
  });

  it("validates health ≤ 100", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockImplementation(() => null);

    const submitAction = vi.fn();
    axiosMock.onGet("/api/game/all").reply(200, gameFixtures.threeGame);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <SetCowHealthForm />
        </Router>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("SetCowHealthForm-healthValue"),
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId("SetCowHealthForm-Submit-Button");
    const healthInput = screen.getByTestId("SetCowHealthForm-healthValue");

    expect(submitButton).toBeInTheDocument();
    expect(healthInput).toHaveValue(100);

    fireEvent.change(healthInput, { target: { value: "101" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Health Value must be ≤ 100/i),
      ).toBeInTheDocument();
    });
    expect(submitAction).not.toBeCalled();
  });

  it("validates health is required", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockImplementation(() => null);

    const submitAction = vi.fn();
    axiosMock.onGet("/api/game/all").reply(200, gameFixtures.threeGame);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <SetCowHealthForm />
        </Router>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("SetCowHealthForm-healthValue"),
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId("SetCowHealthForm-Submit-Button");
    const healthInput = screen.getByTestId("SetCowHealthForm-healthValue");

    expect(submitButton).toBeInTheDocument();
    expect(healthInput).toHaveValue(100);

    fireEvent.change(healthInput, { target: { value: "" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Health Value is required/i)).toBeInTheDocument();
    });
    expect(submitAction).not.toBeCalled();
  });

  it("user can sucessfully submit the job", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockImplementation(() => null);

    const submitAction = vi.fn();
    axiosMock.onGet("/api/game/all").reply(200, gameFixtures.threeGame);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <SetCowHealthForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );

    const gameRadio = await screen.findByTestId("SetCowHealthForm-game-1");
    expect(gameRadio).toBeInTheDocument();
    fireEvent.click(gameRadio);

    const healthInput = screen.getByTestId("SetCowHealthForm-healthValue");
    const submitButton = screen.getByTestId("SetCowHealthForm-Submit-Button");

    expect(healthInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    fireEvent.change(healthInput, { target: { value: "10" } });
    fireEvent.click(submitButton);

    // assert - check that the console.log was called with the expected message
    await waitFor(() => {
      expect(submitAction).toHaveBeenCalled();
    });

    expect(submitAction).toHaveBeenCalledWith({
      healthValue: "10",
      selectedGame: 1,
      selectedGameName: "Anika's Game",
    });
  });

  test("when localstorage has no value, the default value of healthValue is 100", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockImplementation(() => null);
    axiosMock.onGet("/api/game/all").reply(200, gameFixtures.threeGame);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <SetCowHealthForm />
        </Router>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("SetCowHealthForm-healthValue"),
      ).toBeInTheDocument();
    });

    const healthInput = screen.getByTestId("SetCowHealthForm-healthValue");
    expect(healthInput).toHaveValue(100);
  });

  test("healthValue can be loaded from localstorage", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockImplementation((key) =>
      key === "SetCowHealthForm-health" ? 42 : null,
    );
    axiosMock.onGet("/api/game/all").reply(200, gameFixtures.threeGame);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <SetCowHealthForm />
        </Router>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("SetCowHealthForm-healthValue"),
      ).toBeInTheDocument();
    });

    const healthInput = screen.getByTestId("SetCowHealthForm-healthValue");
    expect(healthInput).toHaveValue(42);
  });

  test("healthValue is saved in localstorage", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    getItemSpy.mockImplementation((key) =>
      key === "SetCowHealthForm-health" ? 42 : null,
    );

    axiosMock.onGet("/api/game/all").reply(200, gameFixtures.threeGame);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <SetCowHealthForm />
        </Router>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("SetCowHealthForm-healthValue"),
      ).toBeInTheDocument();
    });

    const healthInput = screen.getByTestId("SetCowHealthForm-healthValue");
    expect(healthInput).toHaveValue(42);

    const submitButton = screen.getByTestId("SetCowHealthForm-Submit-Button");

    fireEvent.change(healthInput, { target: { value: "24" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith("SetCowHealthForm-health", "24");
    });
  });

  test("the first item in game array is selected by default", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockImplementation((key) =>
      key === "SetCowHealthForm-health" ? 42 : null,
    );

    axiosMock.onGet("/api/game/all").reply(200, gameFixtures.threeGame);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <SetCowHealthForm />
        </Router>
      </QueryClientProvider>,
    );

    const defaultId = gameFixtures.threeGame[0].id;
    const testIdForFirstItem = `SetCowHealthForm-game-${defaultId}`;
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
          <SetCowHealthForm />
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
