import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import ReportTable from "main/components/Reports/ReportTable";
import reportFixtures from "fixtures/reportFixtures";
import { vi } from "vitest";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useParams: () => ({
    gameId: 1,
  }),
  useNavigate: () => mockNavigate,
}));

describe("ReportTable tests", () => {
  const testId = "ReportTable";

  const queryClient = new QueryClient();
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  beforeEach(() => {
    localStorage.clear();
  });

  test("sorts by Create Date descending by default", () => {
    // Use a fixture where numeric id order and createDate order diverge,
    // so a mutation that stops sorting by "createDate" specifically
    // (e.g. by breaking the sort column id) is detected.
    const reportsWithDivergentIdOrder = [
      {
        ...reportFixtures.threeReports[0],
        id: 10,
        createDate: "2023-01-01T00:00:00.000+00:00",
      },
      {
        ...reportFixtures.threeReports[1],
        id: 1,
        createDate: "2023-06-01T00:00:00.000+00:00",
      },
      {
        ...reportFixtures.threeReports[2],
        id: 5,
        createDate: "2023-03-01T00:00:00.000+00:00",
      },
    ];

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportTable reports={reportsWithDivergentIdOrder} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const createDateCells = screen.getAllByTestId(
      /ReportTable-cell-row-\d+-col-createDate/,
    );
    const renderedDates = createDateCells.map((cell) => cell.textContent);

    expect(renderedDates).toEqual([
      "2023-06-01T00:00:00.000+00:00",
      "2023-03-01T00:00:00.000+00:00",
      "2023-01-01T00:00:00.000+00:00",
    ]);
  });

  test("renders a Page Size selector defaulting to 20", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportTable reports={reportFixtures.threeReports} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const selector = screen.getByTestId(`${testId}-page-size-selector`);
    expect(selector).toBeInTheDocument();
    expect(selector).toHaveValue("20");
  });

  test("selecting a page size stores it in localStorage under 'reports-page-size'", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportTable reports={reportFixtures.threeReports} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const selector = screen.getByTestId(`${testId}-page-size-selector`);
    fireEvent.change(selector, { target: { value: "50" } });

    await waitFor(() => {
      expect(localStorage.getItem("reports-page-size")).toBe("50");
    });
  });

  test("uses the page size stored in localStorage when it is a valid option", () => {
    localStorage.setItem("reports-page-size", "100");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportTable reports={reportFixtures.threeReports} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const selector = screen.getByTestId(`${testId}-page-size-selector`);
    expect(selector).toHaveValue("100");
  });

  test("falls back to 20 and updates localStorage when the stored value is not a valid option", () => {
    localStorage.setItem("reports-page-size", "37");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportTable reports={reportFixtures.threeReports} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const selector = screen.getByTestId(`${testId}-page-size-selector`);
    expect(selector).toHaveValue("20");
    expect(localStorage.getItem("reports-page-size")).toBe("20");
  });

  test("Has the expected column headers and content", () => {
    // act

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportTable reports={reportFixtures.threeReports} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert

    const expectedFields = [
      "id",
      "gameId",
      "name",
      "numUsers",
      "numCows",
      "createDate",
    ];
    const expectedHeaders = [
      "id",
      "gameId",
      "Name",
      "Num Users",
      "Num Cows",
      "Create Date",
    ];

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "3",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-gameId`),
    ).toHaveTextContent("1");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-name`),
    ).toHaveTextContent("Blue");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-numUsers`),
    ).toHaveTextContent("1");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-numCows`),
    ).toHaveTextContent("3");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-createDate`),
    ).toHaveTextContent("2023-08-07T01:12:09.088+00:00");
  });

  test("When not on storybook, navigates to view page", () => {
    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportTable reports={reportFixtures.threeReports} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-View Report-button`),
    ).toBeInTheDocument();
    const viewButton = screen.getByTestId(
      `${testId}-cell-row-0-col-View Report-button`,
    );
    expect(viewButton).toHaveClass("btn-secondary");
    viewButton.click();
    expect(mockNavigate).toHaveBeenCalledWith("/admin/report/1");
  });

  test("When on storybook, calls window.alert", async () => {
    // arrange

    const mockAlert = vi.spyOn(window, "alert").mockImplementation(() => {});

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportTable reports={reportFixtures.threeReports} storybook={true} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-View Report-button`),
    ).toBeInTheDocument();
    const viewButton = screen.getByTestId(
      `${testId}-cell-row-0-col-View Report-button`,
    );
    viewButton.click();
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        `would navigate to /admin/report/1`,
      );
    });
    mockAlert.mockRestore();
  });

  test("Has all numeric values right-justified", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportTable reports={reportFixtures.threeReports} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getAllByText("1")[2]).toHaveStyle("text-align: right;");
    expect(screen.getAllByText("1")[4]).toHaveStyle("text-align: right;");
    expect(screen.getAllByText("3")[1]).toHaveStyle("text-align: right;");
  });

  test("Renders Delete Report and Purge Older Reports buttons", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportTable reports={reportFixtures.threeReports} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Delete Report-button`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Purge Older Reports-button`),
    ).toBeInTheDocument();
  });

  test("Delete Report button opens modal and confirming deletes the report", async () => {
    axiosMock.onDelete("/api/reports").reply(200, {
      message: "Report with id 1 deleted",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportTable reports={reportFixtures.threeReports} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete Report-button`,
    );
    fireEvent.click(deleteButton);

    const confirmButton = await screen.findByTestId(
      `${testId}-DeleteModal-Delete`,
    );
    fireEvent.click(confirmButton);

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].url).toBe("/api/reports");
    expect(axiosMock.history.delete[0].params).toEqual({ reportId: 1 });

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });
  });

  test("Cancelling the Delete Report modal does not delete the report", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportTable reports={reportFixtures.threeReports} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete Report-button`,
    );
    fireEvent.click(deleteButton);

    const cancelButton = await screen.findByTestId(
      `${testId}-DeleteModal-Cancel`,
    );
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    expect(axiosMock.history.delete.length).toBe(0);
  });

  test("Purge Older Reports button opens modal and confirming purges older reports", async () => {
    axiosMock.onDelete("/api/reports/purge").reply(200, {
      message: "Purged 2 report(s) older than report with id 1",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportTable reports={reportFixtures.threeReports} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const purgeButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Purge Older Reports-button`,
    );
    fireEvent.click(purgeButton);

    const confirmButton = await screen.findByTestId(
      `${testId}-PurgeModal-Purge`,
    );
    fireEvent.click(confirmButton);

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].url).toBe("/api/reports/purge");
    expect(axiosMock.history.delete[0].params).toEqual({ reportId: 1 });

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });
  });

  test("Cancelling the Purge Older Reports modal does not purge reports", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportTable reports={reportFixtures.threeReports} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const purgeButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Purge Older Reports-button`,
    );
    fireEvent.click(purgeButton);

    const cancelButton = await screen.findByTestId(
      `${testId}-PurgeModal-Cancel`,
    );
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    expect(axiosMock.history.delete.length).toBe(0);
  });

  test("Closing the Delete Report modal via the X button cancels the deletion", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportTable reports={reportFixtures.threeReports} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete Report-button`,
    );
    fireEvent.click(deleteButton);

    await screen.findByTestId(`${testId}-DeleteModal`);
    const closeButtons = screen.getAllByLabelText("Close");
    fireEvent.click(closeButtons[0]);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    expect(axiosMock.history.delete.length).toBe(0);
  });

  test("Closing the Purge Older Reports modal via the X button cancels the purge", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportTable reports={reportFixtures.threeReports} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const purgeButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Purge Older Reports-button`,
    );
    fireEvent.click(purgeButton);

    await screen.findByTestId(`${testId}-PurgeModal`);
    const closeButtons = screen.getAllByLabelText("Close");
    fireEvent.click(closeButtons[0]);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    expect(axiosMock.history.delete.length).toBe(0);
  });
});
