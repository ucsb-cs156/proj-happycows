import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import PagedProfitsTable from "main/components/Commons/PagedProfitsTable";
import pagedProfitsFixtures from "fixtures/pagedProfitsFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("PagedProfitsTable tests", () => {
  const queryClient = new QueryClient();
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "PagedProfitsTable";

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  test("renders headers and content correctly for a single page", async () => {
    // Arrange
    axiosMock.onGet("/api/profits/paged/commonsid").reply(200, pagedProfitsFixtures.onePage);

    // Act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedProfitsTable />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Assert
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
    
    expect(axiosMock.history.get[0].url).toBe("/api/profits/paged/commonsid");
    expect(axiosMock.history.get[0].params).toEqual({commonsId: undefined, pageNumber: 0, pageSize: 5 });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-amount`)).toHaveTextContent("110");
    expect(screen.getByTestId(`${testId}-cell-row-0-col-timestamp`)).toHaveTextContent("2024-06-16");
    expect(screen.getByTestId(`${testId}-cell-row-0-col-avgCowHealth`)).toHaveTextContent("100.00%");
    expect(screen.getByTestId(`${testId}-cell-row-0-col-numCows`)).toHaveTextContent("5");

    expect(screen.getByTestId(`${testId}-header-timestamp-sort-carets`)).toHaveTextContent("🔽");

    // Check button states
    const nextButton = screen.queryByTestId(`${testId}-next-button`);
    expect(nextButton).not.toBeInTheDocument();

    const previousButton = screen.queryByTestId(`${testId}-previous-button`);
    expect(previousButton).not.toBeInTheDocument();
  });

  test("displays no buttons when no pages exist", async () => {
    // Arrange
    axiosMock.onGet("/api/profits/paged/commonsid").reply(200, pagedProfitsFixtures.emptyPage);

    // Act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedProfitsTable />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(1);
    });

    // Assert
    expect(axiosMock.history.get[0].url).toBe("/api/profits/paged/commonsid");
    expect(axiosMock.history.get[0].params).toEqual({ commonsId: undefined, pageNumber: 0, pageSize: 5 });

    const nextButton = screen.queryByTestId(`${testId}-next-button`);
    expect(nextButton).not.toBeInTheDocument();

    const previousButton = screen.queryByTestId(`${testId}-previous-button`);
    expect(previousButton).not.toBeInTheDocument();
  });

  test("handles pagination correctly with multiple pages", async () => {
    // Arrange
    axiosMock
      .onGet("/api/profits/paged/commonsid", { params: { commonsId: undefined, pageNumber: 0, pageSize: 5 } })
      .reply(200, pagedProfitsFixtures.twoPages[0]);
    axiosMock
      .onGet("/api/profits/paged/commonsid", { params: { commonsId: undefined, pageNumber: 1, pageSize: 5 } })
      .reply(200, pagedProfitsFixtures.twoPages[1]);

    // Act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedProfitsTable />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const expectedHeaders = ['Profit', 'Date', 'Health', 'Cows'];
    const expectedFields = ['amount', 'timestamp', 'avgCowHealth', 'numCows'];

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

    expect(axiosMock.history.get[0].url).toBe("/api/profits/paged/commonsid");
    expect(axiosMock.history.get[0].params).toEqual({ commonsId: undefined, pageNumber: 0, pageSize: 5 });

    // Assert initial page
    let nextButton = screen.getByTestId(`${testId}-next-button`);
    
    expect(nextButton).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Page: 1")).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-amount`)
    ).toHaveTextContent("20");

    // Move to next page
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText("Page: 2")).toBeInTheDocument();
    });

    let previousButton = screen.queryByTestId(`${testId}-previous-button`);

    expect(previousButton).toBeInTheDocument();
    expect(nextButton).not.toBeInTheDocument();

    // Move back to previous page
    fireEvent.click(previousButton);

    await waitFor(() => {
      expect(screen.getByText("Page: 1")).toBeInTheDocument();
    });

    previousButton = screen.queryByTestId(`${testId}-previous-button`);
    nextButton = screen.queryByTestId(`${testId}-next-button`);

    expect(previousButton).not.toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-amount`)
    ).toHaveTextContent("20"); 

  });

  test("renders no rows if the data is empty", async () => {
    // Arrange
    axiosMock.onGet("/api/profits/paged/commonsid").reply(200, pagedProfitsFixtures.emptyPage);

    // Act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedProfitsTable />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Page: 1")).toBeInTheDocument();
    });

    const rows = screen.queryAllByTestId(new RegExp(`${testId}-cell-row-\\d+-col-`));
    expect(rows.length).toBe(0);
  });

  test("displays the table with flex style", async () => {
    // Act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedProfitsTable />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const divElement = screen.getByTestId("PagedProfitsTable-container");
    expect(window.getComputedStyle(divElement).display).toBe("flex");
  });

  test("disables both buttons on a single page with no content", async () => {
    // Arrange
    axiosMock.onGet("/api/profits/paged/commonsid").reply(200, pagedProfitsFixtures.emptyPage);

    // Act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedProfitsTable />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Page: 1")).toBeInTheDocument();
    });

    const nextButton = screen.queryByTestId(`${testId}-next-button`);
    const previousButton = screen.queryByTestId(`${testId}-previous-button`);

    expect(nextButton).not.toBeInTheDocument();
    expect(previousButton).not.toBeInTheDocument();
  });

  test("displayed with flex style", async () => {

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedProfitsTable />
        </MemoryRouter>
      </QueryClientProvider>

    );

    const divElement = screen.getByTestId('PagedProfitsTable-container');
    expect(window.getComputedStyle(divElement).display).toBe('flex');
  });   
});