import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router";
import CommonsForm from "main/components/Commons/CommonsForm";
import { QueryClient, QueryClientProvider } from "react-query";
import commonsFixtures from "fixtures/commonsFixtures";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import healthUpdateStrategyListFixtures from "fixtures/healthUpdateStrategyListFixtures";
import { vi } from "vitest";

// Next line uses technique from https://www.chakshunyu.com/blog/how-to-spy-on-a-named-import-in-jest/
import * as useBackendModule from "main/utils/useBackend";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("CommonsForm tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly", async () => {
    const submitAction = vi.fn();

    axiosMock
      .onGet("/api/commons/all-health-update-strategies")
      .reply(200, healthUpdateStrategyListFixtures.real);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <CommonsForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Commons Name/)).toBeInTheDocument();

    [
      /Starting Balance/,
      /Cow Price/,
      /Milk Price/,
      /Starting Date/,
      /Last Date/,
      /Degradation Rate/,
      /Capacity Per User/,
      /Carrying Capacity/,
      /Show Leaderboard\?/,
      /When below capacity/,
      /When above capacity/,
    ].forEach((pattern) => {
      expect(screen.getByText(pattern)).toBeInTheDocument();
    });
    expect(screen.getByText(/Create/)).toBeInTheDocument();
    expect(screen.getByTestId("CommonsForm-Submit-Button")).toHaveTextContent(
      "Create",
    );
  });

  it("has validation errors for required fields", async () => {
    const submitAction = vi.fn();

    axiosMock
      .onGet("/api/commons/all-health-update-strategies")
      .reply(200, healthUpdateStrategyListFixtures.real);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <CommonsForm
            submitAction={submitAction}
            buttonLabel="Create New Commons"
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("CommonsForm-name")).toBeInTheDocument();
    const submitButton = screen.getByTestId("CommonsForm-Submit-Button");
    expect(submitButton).toBeInTheDocument();
    expect(screen.getByTestId("CommonsForm-Submit-Button")).toHaveTextContent(
      "Create New Commons",
    );

    fireEvent.change(screen.getByTestId("CommonsForm-degradationRate"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByTestId("CommonsForm-carryingCapacity"), {
      target: { value: "" },
    });

    //Check default empty field
    fireEvent.click(submitButton);
    expect(
      await screen.findByText("Commons name is required"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Degradation rate is required"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Carrying capacity is required"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Capacity Per User is required"),
    ).toBeInTheDocument();

    //Clear Default Values
    fireEvent.change(screen.getByTestId("CommonsForm-milkPrice"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByTestId("CommonsForm-cowPrice"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByTestId("CommonsForm-startingBalance"), {
      target: { value: "" },
    });
    expect(
      await screen.findByText("Cow price is required"),
    ).toBeInTheDocument();
    expect(screen.getByText("Milk price is required")).toBeInTheDocument();
    expect(
      screen.getByText("Starting Balance is required"),
    ).toBeInTheDocument();

    //Reset to Invalid Values
    fireEvent.change(screen.getByTestId("CommonsForm-milkPrice"), {
      target: { value: "-1" },
    });
    fireEvent.change(screen.getByTestId("CommonsForm-cowPrice"), {
      target: { value: "-1" },
    });
    fireEvent.change(screen.getByTestId("CommonsForm-startingBalance"), {
      target: { value: "-1" },
    });
    fireEvent.change(screen.getByTestId("CommonsForm-startingDate"), {
      target: { value: NaN },
    });
    fireEvent.change(screen.getByTestId("CommonsForm-lastDate"), {
      target: { value: NaN },
    });
    fireEvent.click(submitButton);

    //Await
    await screen.findByTestId("CommonsForm-milkPrice");

    [
      "CommonsForm-name",
      "CommonsForm-degradationRate",
      "CommonsForm-capacityPerUser",
      "CommonsForm-carryingCapacity",
      "CommonsForm-milkPrice",
      "CommonsForm-cowPrice",
      "CommonsForm-startingBalance",
      "CommonsForm-startingDate",
      "CommonsForm-lastDate",
    ].forEach((item) => {
      const element = screen.getByTestId(item);
      expect(element).toBeInTheDocument();
      expect(element).toHaveClass("is-invalid");
    });

    // check that the other testids are present

    ["CommonsForm-showLeaderboard", "CommonsForm-showChat"].forEach(
      (testid) => {
        const element = screen.getByTestId(testid);
        expect(element).toBeInTheDocument();
      },
    );

    expect(submitAction).not.toBeCalled();
  });

  it("Check Default Values and correct styles", async () => {
    const curr = new Date();
    const today = curr.toLocaleDateString("en-CA"); // Canadian english gives YYYY-MM-DD
    const fourMonthsLater = new Date(
      curr.getFullYear(),
      curr.getMonth() + 4,
      curr.getDate(),
    ).toLocaleDateString("en-CA");
    const DefaultVals = {
      name: "",
      startingBalance: 10000,
      cowPrice: 100,
      milkPrice: 1,
      degradationRate: 0.001,
      carryingCapacity: 100,
      startingDate: today,
      lastDate: fourMonthsLater,
    };

    axiosMock
      .onGet("/api/commons/all-health-update-strategies")
      .reply(200, healthUpdateStrategyListFixtures.real);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <CommonsForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("CommonsForm-name")).toBeInTheDocument();
    [
      "name",
      "degradationRate",
      "carryingCapacity",
      "milkPrice",
      "cowPrice",
      "startingBalance",
      "startingDate",
      "lastDate",
    ].forEach((item) => {
      const element = screen.getByTestId(`CommonsForm-${item}`);
      expect(element).toHaveValue(DefaultVals[item]);
    });

    // Check Style
    expect(screen.getByTestId("CommonsForm-r0")).toHaveStyle("width: 80%");
    expect(screen.getByTestId("CommonsForm-r1")).toHaveStyle("width: 80%");
    expect(screen.getByTestId("CommonsForm-r2")).toHaveStyle("width: 80%");
    expect(screen.getByTestId("CommonsForm-r3")).toHaveStyle("width: 300px");
    expect(screen.getByTestId("CommonsForm-r3")).toHaveStyle("height: 50px");
    expect(screen.getByTestId("CommonsForm-r4")).toHaveStyle("width: 300px");
    expect(screen.getByTestId("CommonsForm-r4")).toHaveStyle("height: 50px");
    expect(screen.getByTestId("CommonsForm-Submit-Button")).toHaveStyle(
      "width: 30%",
    );
  });

  it("has validation errors for values out of range", async () => {
    const submitAction = vi.fn();

    axiosMock
      .onGet("/api/commons/all-health-update-strategies")
      .reply(200, healthUpdateStrategyListFixtures.real);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <CommonsForm submitAction={submitAction} buttonLabel="Create" />
        </Router>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("CommonsForm-Submit-Button"),
    ).toBeInTheDocument();
    const submitButton = screen.getByTestId("CommonsForm-Submit-Button");
    expect(submitButton).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("CommonsForm-startingBalance"), {
      target: { value: "-1" },
    });
    fireEvent.click(submitButton);
    await screen.findByText(/Starting Balance must be ≥ 0.00/i);

    fireEvent.change(screen.getByTestId("CommonsForm-cowPrice"), {
      target: { value: "-1" },
    });
    fireEvent.click(submitButton);
    await screen.findByText(/Cow price must be ≥ 0.01/i);

    fireEvent.change(screen.getByTestId("CommonsForm-milkPrice"), {
      target: { value: "-1" },
    });
    fireEvent.click(submitButton);
    await screen.findByText(/Milk price must be ≥ 0.01/i);

    fireEvent.change(screen.getByTestId("CommonsForm-degradationRate"), {
      target: { value: "-1" },
    });
    fireEvent.click(submitButton);
    await screen.findByText(/Degradation rate must be ≥ 0/i);

    fireEvent.change(screen.getByTestId("CommonsForm-carryingCapacity"), {
      target: { value: "-1" },
    });
    fireEvent.click(submitButton);
    await screen.findByText(/Carrying Capacity must be ≥ 1/i);

    expect(submitAction).not.toBeCalled();
  });

  it("renders correctly when an initialCommons is passed in", async () => {
    axiosMock
      .onGet("/api/commons/all-health-update-strategies")
      .reply(200, healthUpdateStrategyListFixtures.real);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <CommonsForm initialCommons={commonsFixtures.threeCommons[0]} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Id/)).toBeInTheDocument();

    expect(screen.getByTestId("CommonsForm-id")).toHaveValue(
      `${commonsFixtures.threeCommons[0].id}`,
    );
    expect(screen.getByTestId("CommonsForm-name")).toHaveValue(
      commonsFixtures.threeCommons[0].name,
    );
    expect(screen.getByTestId("CommonsForm-startingBalance")).toHaveValue(
      commonsFixtures.threeCommons[0].startingBalance,
    );
    expect(screen.getByTestId("CommonsForm-cowPrice")).toHaveValue(
      commonsFixtures.threeCommons[0].cowPrice,
    );

    await screen.findByTestId("aboveCapacityHealthUpdateStrategy-Noop");
    expect(
      screen.getByTestId("belowCapacityHealthUpdateStrategy-Noop"),
    ).toBeInTheDocument();
  });

  it("renders correctly with date cut off", async () => {
    axiosMock
      .onGet("/api/commons/all-health-update-strategies")
      .reply(200, healthUpdateStrategyListFixtures.real);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <CommonsForm initialCommons={commonsFixtures.threeCommons[0]} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Id/)).toBeInTheDocument();
    expect(screen.getByTestId("CommonsForm-startingDate")).toHaveValue(
      commonsFixtures.threeCommons[0].startingDate.split("T")[0],
    );
    expect(screen.getByTestId("CommonsForm-lastDate")).toHaveValue(
      commonsFixtures.threeCommons[0].lastDate.split("T")[0],
    );
  });

  it("shows explanatory tooltips over the starting and last date fields", async () => {
    axiosMock
      .onGet("/api/commons/all-health-update-strategies")
      .reply(200, healthUpdateStrategyListFixtures.real);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <CommonsForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("CommonsForm-name")).toBeInTheDocument();

    fireEvent.mouseOver(screen.getByTestId("CommonsForm-startingDate"));
    expect(
      await screen.findByText(
        "The first day of play: the game begins at midnight (00:00) at the start of this date.",
      ),
    ).toBeInTheDocument();

    fireEvent.mouseOver(screen.getByTestId("CommonsForm-lastDate"));
    expect(
      await screen.findByText(
        "The last day of play: the game ends at midnight at the end of this date.",
      ),
    ).toBeInTheDocument();
  });

  it("has validation errors when dates are missing", async () => {
    const submitAction = vi.fn();

    axiosMock
      .onGet("/api/commons/all-health-update-strategies")
      .reply(200, healthUpdateStrategyListFixtures.real);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <CommonsForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("CommonsForm-name")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("CommonsForm-startingDate"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByTestId("CommonsForm-lastDate"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByTestId("CommonsForm-Submit-Button"));

    expect(
      await screen.findByText("Starting date is required"),
    ).toBeInTheDocument();
    expect(screen.getByText("Last date is required")).toBeInTheDocument();
    expect(submitAction).not.toBeCalled();
  });

  it("requires the last date to be after the starting date", async () => {
    const submitAction = vi.fn();

    axiosMock
      .onGet("/api/commons/all-health-update-strategies")
      .reply(200, healthUpdateStrategyListFixtures.real);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <CommonsForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("CommonsForm-name")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("CommonsForm-name"), {
      target: { value: "My Commons" },
    });
    fireEvent.change(screen.getByTestId("CommonsForm-capacityPerUser"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByTestId("CommonsForm-startingDate"), {
      target: { value: "2024-05-10" },
    });

    // equal dates are invalid: the last date must be strictly after
    fireEvent.change(screen.getByTestId("CommonsForm-lastDate"), {
      target: { value: "2024-05-10" },
    });
    fireEvent.click(screen.getByTestId("CommonsForm-Submit-Button"));
    expect(
      await screen.findByText("Last date must be after starting date"),
    ).toBeInTheDocument();
    expect(submitAction).not.toBeCalled();

    // an earlier date is also invalid
    fireEvent.change(screen.getByTestId("CommonsForm-lastDate"), {
      target: { value: "2024-05-09" },
    });
    fireEvent.click(screen.getByTestId("CommonsForm-Submit-Button"));
    expect(
      await screen.findByText("Last date must be after starting date"),
    ).toBeInTheDocument();
    expect(submitAction).not.toBeCalled();

    // a later date is valid
    fireEvent.change(screen.getByTestId("CommonsForm-lastDate"), {
      target: { value: "2024-05-11" },
    });
    fireEvent.click(screen.getByTestId("CommonsForm-Submit-Button"));
    await waitFor(() => {
      expect(submitAction).toBeCalled();
    });
    expect(
      screen.queryByText("Last date must be after starting date"),
    ).not.toBeInTheDocument();
  });

  it("renders correctly when an initialCommons is not passed in", async () => {
    const curr = new Date();
    const today = curr.toLocaleDateString("en-CA"); // Canadian english gives YYYY-MM-DD
    const fourMonthsLater = new Date(
      curr.getFullYear(),
      curr.getMonth() + 4,
      curr.getDate(),
    ).toLocaleDateString("en-CA");
    const DefaultVals = {
      name: "",
      startingBalance: 10000,
      cowPrice: 100,
      milkPrice: 1,
      degradationRate: 0.001,
      carryingCapacity: 100,
      startingDate: today,
      lastDate: fourMonthsLater,
      aboveCapacityStrategy: "Linear",
      belowCapacityStrategy: "Constant",
    };
    axiosMock
      .onGet("/api/commons/all-health-update-strategies")
      .reply(200, healthUpdateStrategyListFixtures.real);
    axiosMock.onGet("/api/commons/defaults").reply(200, DefaultVals);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <CommonsForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("CommonsForm-name")).toBeInTheDocument();
    [
      "name",
      "degradationRate",
      "carryingCapacity",
      "milkPrice",
      "cowPrice",
      "startingBalance",
      "startingDate",
      "lastDate",
    ].forEach((item) => {
      const element = screen.getByTestId(`CommonsForm-${item}`);
      expect(element).toHaveValue(DefaultVals[item]);
    });
    expect(await screen.findByText(/When below capacity/)).toBeInTheDocument();

    expect(
      screen.getByTestId("aboveCapacityHealthUpdateStrategy-Linear"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("aboveCapacityHealthUpdateStrategy-Linear"),
    ).toHaveAttribute("selected");
    expect(
      screen.getByTestId("belowCapacityHealthUpdateStrategy-Constant"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("belowCapacityHealthUpdateStrategy-Constant"),
    ).toHaveAttribute("selected");
  });

  test("the correct parameters are passed to useBackend", async () => {
    axiosMock
      .onGet("/api/commons/all-health-update-strategies")
      .reply(200, healthUpdateStrategyListFixtures.real);

    // https://www.chakshunyu.com/blog/how-to-spy-on-a-named-import-in-jest/
    const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <CommonsForm />
        </Router>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(useBackendSpy).toHaveBeenCalledWith(
        "/api/commons/all-health-update-strategies",
        {
          method: "GET",
          url: "/api/commons/all-health-update-strategies",
        },
      );
    });
  });

  test("populates form fields with default values when initialCommons is not provided", async () => {
    const curr = new Date();
    const today = curr.toLocaleDateString("en-CA"); // Canadian english gives YYYY-MM-DD
    const fourMonthsLater = new Date(
      curr.getFullYear(),
      curr.getMonth() + 4,
      curr.getDate(),
    ).toLocaleDateString("en-CA");
    const defaultValuesData = {
      name: "",
      startingBalance: 10000,
      cowPrice: 100,
      milkPrice: 1,
      degradationRate: 0.001,
      carryingCapacity: 100,
      startingDate: today,
      lastDate: fourMonthsLater,
    };

    vi.spyOn(useBackendModule, "useBackend").mockReturnValue({
      data: defaultValuesData,
    });

    vi.spyOn(useBackendModule, "useBackend").mockReturnValue({
      data: healthUpdateStrategyListFixtures.real,
    });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <CommonsForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("CommonsForm-startingBalance"),
    ).toHaveValue(defaultValuesData.startingBalance);
    expect(screen.getByTestId("CommonsForm-name")).toHaveValue(
      defaultValuesData.name,
    );
    expect(screen.getByTestId("CommonsForm-cowPrice")).toHaveValue(
      defaultValuesData.cowPrice,
    );
    expect(screen.getByTestId("CommonsForm-milkPrice")).toHaveValue(
      defaultValuesData.milkPrice,
    );
    expect(screen.getByTestId("CommonsForm-degradationRate")).toHaveValue(
      defaultValuesData.degradationRate,
    );
    expect(screen.getByTestId("CommonsForm-carryingCapacity")).toHaveValue(
      defaultValuesData.carryingCapacity,
    );
    expect(screen.getByTestId("CommonsForm-startingDate")).toHaveValue(
      defaultValuesData.startingDate,
    );
    expect(screen.getByTestId("CommonsForm-lastDate")).toHaveValue(
      defaultValuesData.lastDate,
    );
  });
});
