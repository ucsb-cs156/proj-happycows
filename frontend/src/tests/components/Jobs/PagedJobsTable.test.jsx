import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import PagedJobsTable from "main/components/Jobs/PagedJobsTable";
import pagedJobsFixtures from "fixtures/pagedJobsFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
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

describe("PagedJobsTable tests", () => {
  const queryClient = new QueryClient();

  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "PagedJobsTable";

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    queryClient.clear();
    mockToast.mockClear();
  });

  const pageWithOneJob = (job) => ({
    ...pagedJobsFixtures.emptyPage,
    content: [
      {
        createdAt: "2023-08-08T12:14:00.041855-07:00",
        updatedAt: "2023-08-08T12:14:00.211631-07:00",
        ...job,
      },
    ],
    totalPages: 1,
    totalElements: 1,
    numberOfElements: 1,
    empty: false,
  });

  const renderTable = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedJobsTable />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  test("renders correct content", async () => {
    // arrange

    axiosMock
      .onGet("/api/jobs/paginated")
      .reply(200, pagedJobsFixtures.onePage);

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedJobsTable />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    const expectedHeaders = [
      "id",
      "Created",
      "Updated",
      "Status",
      "Cancel",
      "Log",
    ];
    const expectedFields = [
      "id",
      "Created",
      "Updated",
      "status",
      "Cancel",
      "Log",
    ];

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    await screen.findByTestId(`${testId}-cell-row-0-col-id`);

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(axiosMock.history.get[0].url).toBe("/api/jobs/paginated");
    expect(axiosMock.history.get[0].params).toEqual({
      page: 0,
      pageSize: 10,
      sortField: "id",
      sortDirection: "DESC",
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Created`),
    ).toHaveTextContent("8/8/2023, 12:14:00");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Updated`),
    ).toHaveTextContent("8/8/2023, 12:14:00");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-status`),
    ).toHaveTextContent("complete");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Log`),
    ).toHaveTextContent(
      `Updating cow health...Game Blue, degradationRate: 0.1, carryingCapacity: 10User: Phill Conrad, numCows: 3, cowHealth: 100.0 old cow health: 100.0, new cow health: 100.0User: Phillip Conrad, numCows: 7, cowHealth: 100.0 old cow health: 100.0, new cow health: 100.0Game Red, degradationRate: 0.1, carryingCapacity: 2User: Phill Conrad, numCows: 10, cowHealth: 54.40000000000016 old cow health: 54.40000000000016, new cow health: 53.600000000000165Cow health has been updated!`,
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Log-link`),
    ).toHaveAttribute("href", "/admin/jobs/logs/120");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Log-link`),
    ).toHaveTextContent("See entire log");
    // a complete job cannot be cancelled
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Cancel-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.getByTestId(`${testId}-header-id-sort-carets`),
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
      .onGet("/api/jobs/paginated")
      .reply(200, pagedJobsFixtures.emptyPage);

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedJobsTable />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(1);
    });

    expect(axiosMock.history.get[0].url).toBe("/api/jobs/paginated");
    expect(axiosMock.history.get[0].params).toEqual({
      page: 0,
      pageSize: 10,
      sortField: "id",
      sortDirection: "DESC",
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
      .onGet("/api/jobs/paginated", {
        params: {
          page: 0,
          pageSize: 10,
          sortField: "id",
          sortDirection: "DESC",
        },
      })
      .reply(200, pagedJobsFixtures.fourPages[0]);
    axiosMock
      .onGet("/api/jobs/paginated", {
        params: {
          page: 1,
          pageSize: 10,
          sortField: "id",
          sortDirection: "DESC",
        },
      })
      .reply(200, pagedJobsFixtures.fourPages[1]);
    axiosMock
      .onGet("/api/jobs/paginated", {
        params: {
          page: 2,
          pageSize: 10,
          sortField: "id",
          sortDirection: "DESC",
        },
      })
      .reply(200, pagedJobsFixtures.fourPages[2]);
    axiosMock
      .onGet("/api/jobs/paginated", {
        params: {
          page: 3,
          pageSize: 10,
          sortField: "id",
          sortDirection: "DESC",
        },
      })
      .reply(200, pagedJobsFixtures.fourPages[3]);

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedJobsTable />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    const expectedHeaders = [
      "id",
      "Created",
      "Updated",
      "Status",
      "Cancel",
      "Log",
    ];
    const expectedFields = [
      "id",
      "Created",
      "Updated",
      "status",
      "Cancel",
      "Log",
    ];

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

    expect(axiosMock.history.get[0].url).toBe("/api/jobs/paginated");
    expect(axiosMock.history.get[0].params).toEqual({
      page: 0,
      pageSize: 10,
      sortField: "id",
      sortDirection: "DESC",
    });

    const nextButton = screen.getByTestId(`${testId}-next-button`);
    expect(nextButton).toBeInTheDocument();

    const previousButton = screen.getByTestId(`${testId}-previous-button`);
    expect(previousButton).toBeInTheDocument();

    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeEnabled();

    expect(screen.getByText(`Page: 1`)).toBeInTheDocument();
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(`Page: 2`)).toBeInTheDocument();
    });
    expect(previousButton).toBeEnabled();
    expect(nextButton).toBeEnabled();

    fireEvent.click(previousButton);
    await waitFor(() => {
      expect(screen.getByText(`Page: 1`)).toBeInTheDocument();
    });
    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeEnabled();

    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByText(`Page: 2`)).toBeInTheDocument();
    });

    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByText(`Page: 3`)).toBeInTheDocument();
    });

    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByText(`Page: 4`)).toBeInTheDocument();
    });
    expect(previousButton).toBeEnabled();
    expect(nextButton).toBeDisabled();
  });

  test.each(["queued", "running"])(
    "shows a Cancel button for a %s job",
    async (status) => {
      axiosMock
        .onGet("/api/jobs/paginated")
        .reply(200, pageWithOneJob({ id: 5, status, log: "" }));

      renderTable();

      expect(
        await screen.findByTestId(`${testId}-cell-row-0-col-Cancel-button`),
      ).toHaveTextContent("Cancel");
    },
  );

  test.each(["complete", "error", "cancelling", "cancelled", "interrupted"])(
    "does not show a Cancel button for a %s job",
    async (status) => {
      axiosMock
        .onGet("/api/jobs/paginated")
        .reply(200, pageWithOneJob({ id: 5, status, log: "" }));

      renderTable();

      await screen.findByTestId(`${testId}-cell-row-0-col-id`);
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-Cancel-button`),
      ).not.toBeInTheDocument();
    },
  );

  test("clicking Cancel posts to the cancel endpoint and toasts", async () => {
    axiosMock
      .onGet("/api/jobs/paginated")
      .reply(200, pageWithOneJob({ id: 5, status: "running", log: "" }));
    axiosMock
      .onPost("/api/jobs/5/cancel")
      .reply(200, { id: 5, status: "cancelling" });

    renderTable();

    const cancelButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Cancel-button`,
    );
    fireEvent.click(cancelButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].url).toBe("/api/jobs/5/cancel");
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith("Cancellation requested."),
    );
  });

  test("a job with no log preview still gets a link to the full log", async () => {
    axiosMock
      .onGet("/api/jobs/paginated")
      .reply(200, pageWithOneJob({ id: 5, status: "queued", log: null }));

    renderTable();

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-Log-link`),
    ).toHaveAttribute("href", "/admin/jobs/logs/5");
    expect(screen.getByTestId("plaintext-empty")).toBeInTheDocument();
  });
});
