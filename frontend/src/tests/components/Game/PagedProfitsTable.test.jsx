import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, useParams } from "react-router";
import PagedProfitsTable from "main/components/Game/PagedProfitsTable";
import pagedProfitsFixtures from "fixtures/pagedProfitsFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useParams: vi.fn(),
}));

describe("PagedProfitsTable tests", () => {
  const queryClient = new QueryClient();

  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "PagedProfitsTable";

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    queryClient.clear();
    useParams.mockReturnValue({ gameId: undefined, userId: undefined });
  });

  test("renders correct content", async () => {
    // arrange
    axiosMock
      .onGet("/api/profits/paged/gameid")
      .reply(200, pagedProfitsFixtures.onePage);

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedProfitsTable />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    const expectedHeaders = ["Profit", "Date", "Health", "Cows"];
    const expectedFields = ["amount", "timestamp", "avgCowHealth", "numCows"];

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    await screen.findByTestId(`${testId}-cell-row-0-col-amount`);

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(axiosMock.history.get[0].url).toBe("/api/profits/paged/gameid");
    expect(axiosMock.history.get[0].params).toEqual({
      gameId: undefined,
      pageNumber: 0,
      pageSize: 5,
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-amount`),
    ).toHaveTextContent("110");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-timestamp`),
    ).toHaveTextContent("2024-06-16");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-avgCowHealth`),
    ).toHaveTextContent("100.00%");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-numCows`),
    ).toHaveTextContent("5");

    const divContainer = screen.getByTestId("PagedProfitsTable-CSS");
    expect(divContainer).toHaveStyle({ display: "flex", overflow: "auto" });
    expect(
      screen.getByTestId(`${testId}-header-timestamp-sort-carets`),
    ).toHaveTextContent("🔽");

    const nextButton = screen.getByTestId(`${testId}-next-button`);
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toBeDisabled();

    const previousButton = screen.getByTestId(`${testId}-previous-button`);
    expect(previousButton).toBeInTheDocument();
    expect(previousButton).toBeDisabled();
  });

  test("buttons are disabled where there are zero pages", async () => {
    // arrange

    axiosMock
      .onGet("/api/profits/paged/gameid")
      .reply(200, pagedProfitsFixtures.emptyPage);

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedProfitsTable />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(1);
    });

    expect(axiosMock.history.get[0].url).toBe("/api/profits/paged/gameid");
    expect(axiosMock.history.get[0].params).toEqual({
      gameId: undefined,
      pageNumber: 0,
      pageSize: 5,
    });

    const nextButton = screen.getByTestId(`${testId}-next-button`);
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toBeDisabled();

    const previousButton = screen.getByTestId(`${testId}-previous-button`);
    expect(previousButton).toBeInTheDocument();
    expect(previousButton).toBeDisabled();
  });

  test("renders correct content with multiple pages", async () => {
    // arrange

    axiosMock
      .onGet("/api/profits/paged/gameid", {
        params: { gameId: undefined, pageNumber: 0, pageSize: 5 },
      })
      .reply(200, pagedProfitsFixtures.twoPages[0]);
    axiosMock
      .onGet("/api/profits/paged/gameid", {
        params: { gameId: undefined, pageNumber: 1, pageSize: 5 },
      })
      .reply(200, pagedProfitsFixtures.twoPages[1]);

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedProfitsTable />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    const expectedHeaders = ["Profit", "Date", "Health", "Cows"];
    const expectedFields = ["amount", "timestamp", "avgCowHealth", "numCows"];

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(1);
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(axiosMock.history.get[0].url).toBe("/api/profits/paged/gameid");
    expect(axiosMock.history.get[0].params).toEqual({
      gameId: undefined,
      pageNumber: 0,
      pageSize: 5,
    });

    const nextButton = screen.getByTestId(`${testId}-next-button`);
    expect(nextButton).toBeInTheDocument();

    const previousButton = screen.getByTestId(`${testId}-previous-button`);
    expect(previousButton).toBeInTheDocument();

    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeEnabled();

    expect(screen.getByText(`Page: 1`)).toBeInTheDocument();

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-amount`),
    ).toHaveTextContent("20");

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(`Page: 2`)).toBeInTheDocument();
    });
    expect(previousButton).toBeEnabled();
    expect(nextButton).toBeDisabled();

    fireEvent.click(previousButton);
    await waitFor(() => {
      expect(screen.getByText(`Page: 1`)).toBeInTheDocument();
    });
    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeEnabled();

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-amount`),
    ).toHaveTextContent("20");
  });

  test("uses the admin endpoint with an explicit userId when a :userId route param is present", async () => {
    // arrange
    useParams.mockReturnValue({ gameId: "7", userId: "42" });
    axiosMock
      .onGet("/api/profits/paged")
      .reply(200, pagedProfitsFixtures.onePage);

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedProfitsTable />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    await screen.findByTestId(`${testId}-cell-row-0-col-amount`);

    expect(axiosMock.history.get[0].url).toBe("/api/profits/paged");
    expect(axiosMock.history.get[0].params).toEqual({
      userId: "42",
      gameId: "7",
      pageNumber: 0,
      pageSize: 5,
    });
  });
});
