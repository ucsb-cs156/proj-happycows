import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import FarmerActivityTable from "main/components/Game/FarmerActivityTable";

describe("FarmerActivityTable tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "FarmerActivityTable";

  const activity = [
    {
      id: 3,
      studentId: 42,
      timestamp: "2024-01-15T10:20:00",
      activityType: 1,
      numCows: 3,
    },
    {
      id: 2,
      studentId: 42,
      timestamp: "2024-01-15T10:15:00",
      activityType: 2,
      numCows: 1,
    },
    {
      id: 1,
      studentId: 42,
      timestamp: "2024-01-15T10:00:00",
      activityType: 0,
      numCows: 0,
    },
  ];

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  const renderTable = (props = {}) => {
    return render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <FarmerActivityTable gameId={1} userId={2} {...props} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders the table flush left, not centered", async () => {
    axiosMock
      .onGet("/api/farmeractivity/all", { params: { userId: 2, gameId: 1 } })
      .reply(200, activity);

    const { container } = renderTable();

    await waitFor(() => {
      expect(container.querySelector("table")).toBeInTheDocument();
    });
    expect(container.querySelector("table")).toHaveStyle({ margin: "0" });
  });

  test("fetches from the admin endpoint with gameId/userId and renders rows", async () => {
    axiosMock
      .onGet("/api/farmeractivity/all", { params: { userId: 2, gameId: 1 } })
      .reply(200, activity);

    renderTable();

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-activityType`),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-activityType`),
    ).toHaveTextContent("Bought Cows");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-activityType`),
    ).toHaveTextContent("Sold Cows");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-activityType`),
    ).toHaveTextContent("Viewed Play Page");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-numCows`),
    ).toHaveTextContent("3");

    expect(axiosMock.history.get[0].params).toEqual({ userId: 2, gameId: 1 });
  });

  test("formats the timestamp column", async () => {
    axiosMock
      .onGet("/api/farmeractivity/all", { params: { userId: 2, gameId: 1 } })
      .reply(200, [activity[0]]);

    renderTable();

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-timestamp`),
      ).toBeInTheDocument();
    });

    // formatDateTime renders e.g. "01/15/2024, 10:20 AM" - just assert it's
    // not the raw ISO string, and contains the date.
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-timestamp`),
    ).toHaveTextContent("01/15/2024");
  });

  test("falls back to the raw activityType value for an unrecognized type", async () => {
    axiosMock
      .onGet("/api/farmeractivity/all", { params: { userId: 2, gameId: 1 } })
      .reply(200, [{ ...activity[0], activityType: 99 }]);

    renderTable();

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-activityType`),
      ).toHaveTextContent("99");
    });
  });

  test("renders headers even when there is no activity", async () => {
    axiosMock
      .onGet("/api/farmeractivity/all", { params: { userId: 2, gameId: 1 } })
      .reply(200, []);

    renderTable();

    await waitFor(() => {
      expect(screen.getByText("Timestamp")).toBeInTheDocument();
    });
    expect(screen.getByText("Activity")).toBeInTheDocument();
    expect(screen.getByText("Cows")).toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-activityType`),
    ).not.toBeInTheDocument();
  });

  test("PageSizeSelector controls the table's page size, defaulting to 10", async () => {
    const manyRows = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      studentId: 42,
      timestamp: "2024-01-15T10:00:00",
      activityType: 0,
      numCows: 0,
    }));
    axiosMock
      .onGet("/api/farmeractivity/all", { params: { userId: 2, gameId: 1 } })
      .reply(200, manyRows);

    renderTable();

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-9-col-activityType`),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId(`${testId}-cell-row-10-col-activityType`),
    ).not.toBeInTheDocument();

    const pageSizeSelector = screen.getByTestId(`${testId}-page-size-selector`);
    fireEvent.change(pageSizeSelector, { target: { value: "50" } });

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-14-col-activityType`),
      ).toBeInTheDocument();
    });
  });
});
