import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import ParticipationGradeTabComponent from "main/components/Courses/ParticipationGradeTabComponent";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("ParticipationGradeTabComponent tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testid = "ParticipationGradeTabComponent";

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockToast.mockClear();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <ParticipationGradeTabComponent courseId={1} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  const fillDates = (start, end) => {
    fireEvent.change(screen.getByTestId(`${testid}-startDate`), {
      target: { value: start },
    });
    fireEvent.change(screen.getByTestId(`${testid}-endDate`), {
      target: { value: end },
    });
  };

  test("renders the form with the expected default weights", () => {
    renderComponent();

    expect(screen.getByTestId(`${testid}-criterion1Weight`)).toHaveValue(40);
    expect(screen.getByTestId(`${testid}-criterion2Weight`)).toHaveValue(40);
    expect(screen.getByTestId(`${testid}-criterion2MinDays`)).toHaveValue(5);
    expect(
      screen.getByTestId(`${testid}-criterion2PartialCredit`),
    ).not.toBeChecked();
    expect(screen.getByTestId(`${testid}-criterion3Weight`)).toHaveValue(20);
    expect(screen.getByTestId(`${testid}-totalPoints`)).toHaveValue(100);
    expect(screen.getByTestId(`${testid}-totalWeight`)).toHaveTextContent(
      "100%",
    );
    expect(screen.getByTestId(`${testid}-totalWeight`)).not.toHaveTextContent(
      "must equal",
    );

    // No field should start out flagged invalid.
    [
      "startDate",
      "endDate",
      "totalPoints",
      "criterion1Weight",
      "criterion2Weight",
      "criterion2MinDays",
      "criterion3Weight",
    ].forEach((field) => {
      expect(screen.getByTestId(`${testid}-${field}`)).not.toHaveClass(
        "is-invalid",
      );
    });
  });

  test("does not show the days-in-period hint or the download button before a date range is chosen", () => {
    renderComponent();

    expect(
      screen.queryByTestId(`${testid}-daysInPeriod`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testid}-download-button`),
    ).not.toBeInTheDocument();
  });

  test("shows the number of days in the selected period, inclusive of both ends", () => {
    renderComponent();

    fillDates("2026-01-01", "2026-01-10");

    expect(screen.getByTestId(`${testid}-daysInPeriod`)).toHaveTextContent(
      "10 day(s) in the selected period.",
    );
  });

  test("does not show the days-in-period hint when only the start date is filled in", () => {
    renderComponent();

    fireEvent.change(screen.getByTestId(`${testid}-startDate`), {
      target: { value: "2026-01-01" },
    });

    expect(
      screen.queryByTestId(`${testid}-daysInPeriod`),
    ).not.toBeInTheDocument();
  });

  test("does not show the days-in-period hint when only the end date is filled in", () => {
    renderComponent();

    fireEvent.change(screen.getByTestId(`${testid}-endDate`), {
      target: { value: "2026-01-10" },
    });

    expect(
      screen.queryByTestId(`${testid}-daysInPeriod`),
    ).not.toBeInTheDocument();
  });

  test("does not show the days-in-period hint when the end date is before the start date", () => {
    renderComponent();

    fillDates("2026-01-10", "2026-01-01");

    expect(
      screen.queryByTestId(`${testid}-daysInPeriod`),
    ).not.toBeInTheDocument();
  });

  test("shows a 1-day period when start and end date are the same", () => {
    renderComponent();

    fillDates("2026-01-01", "2026-01-01");

    expect(screen.getByTestId(`${testid}-daysInPeriod`)).toHaveTextContent(
      "1 day(s) in the selected period.",
    );
  });

  test("updates the live total weight display as weights change", () => {
    renderComponent();

    fireEvent.change(screen.getByTestId(`${testid}-criterion1Weight`), {
      target: { value: "50" },
    });

    expect(screen.getByTestId(`${testid}-totalWeight`)).toHaveTextContent(
      "110% (must equal 100%)",
    );
  });

  test("treats a cleared weight field as 0 in the live total weight display", () => {
    renderComponent();

    fireEvent.change(screen.getByTestId(`${testid}-criterion1Weight`), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByTestId(`${testid}-criterion3Weight`), {
      target: { value: "" },
    });

    // criterion1 and criterion3 cleared (treated as 0) + criterion2's
    // default of 40 = 40%
    expect(screen.getByTestId(`${testid}-totalWeight`)).toHaveTextContent(
      "40% (must equal 100%)",
    );
  });

  test("shows an error when start date is left empty", async () => {
    renderComponent();

    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    expect(
      await screen.findByText("Start date is required"),
    ).toBeInTheDocument();
    expect(axiosMock.history.get.length).toBe(0);
  });

  test("shows an error when end date is left empty", async () => {
    renderComponent();

    fireEvent.change(screen.getByTestId(`${testid}-startDate`), {
      target: { value: "2026-01-01" },
    });
    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    expect(await screen.findByText("End date is required")).toBeInTheDocument();
    expect(axiosMock.history.get.length).toBe(0);
  });

  test("shows an error when totalPoints is left empty", async () => {
    renderComponent();
    fillDates("2026-01-01", "2026-01-10");

    fireEvent.change(screen.getByTestId(`${testid}-totalPoints`), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    expect(
      await screen.findByText("Total points is required"),
    ).toBeInTheDocument();
    expect(axiosMock.history.get.length).toBe(0);
  });

  test("shows an error when totalPoints is not greater than 0", async () => {
    renderComponent();
    fillDates("2026-01-01", "2026-01-10");

    fireEvent.change(screen.getByTestId(`${testid}-totalPoints`), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    expect(
      await screen.findByText("Total points must be > 0"),
    ).toBeInTheDocument();
    expect(axiosMock.history.get.length).toBe(0);
  });

  test("submitting a changed totalPoints sends it as a number, not a string", async () => {
    axiosMock.onGet("/api/participationgrade/compute").reply(200, []);
    renderComponent();
    fillDates("2026-01-01", "2026-01-10");

    fireEvent.change(screen.getByTestId(`${testid}-totalPoints`), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    await waitFor(() => expect(axiosMock.history.get.length).toBe(1));
    expect(axiosMock.history.get[0].params.totalPoints).toBe(50);
  });

  test.each([
    ["criterion1Weight", "-10"],
    ["criterion1Weight", "150"],
    ["criterion2Weight", "-10"],
    ["criterion2Weight", "150"],
    ["criterion3Weight", "-10"],
    ["criterion3Weight", "150"],
  ])(
    "shows 'Weight must be 0-100' when %s is set to %s",
    async (field, value) => {
      renderComponent();
      fillDates("2026-01-01", "2026-01-10");

      fireEvent.change(screen.getByTestId(`${testid}-${field}`), {
        target: { value },
      });
      fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

      expect(await screen.findByTestId(`${testid}-${field}`)).toHaveClass(
        "is-invalid",
      );
      expect(
        screen.getAllByText("Weight must be 0-100").length,
      ).toBeGreaterThan(0);
      expect(axiosMock.history.get.length).toBe(0);
    },
  );

  test("treats criterion1Weight and criterion3Weight of 0 as valid inputs to the sum check", async () => {
    axiosMock.onGet("/api/participationgrade/compute").reply(200, []);
    renderComponent();
    fillDates("2026-01-01", "2026-01-10");

    fireEvent.change(screen.getByTestId(`${testid}-criterion1Weight`), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByTestId(`${testid}-criterion2Weight`), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByTestId(`${testid}-criterion3Weight`), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    await waitFor(() => expect(axiosMock.history.get.length).toBe(1));
    expect(axiosMock.history.get[0].params).toMatchObject({
      criterion1Weight: 0,
      criterion2Weight: 100,
      criterion3Weight: 0,
    });
  });

  test("rejects submission when weights do not sum to 100", async () => {
    renderComponent();
    fillDates("2026-01-01", "2026-01-10");

    fireEvent.change(screen.getByTestId(`${testid}-criterion1Weight`), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    expect(
      await screen.findByText(
        "The three weights must sum to 100 (currently 110)",
      ),
    ).toBeInTheDocument();
    expect(axiosMock.history.get.length).toBe(0);
  });

  test("rejects submission when the end date is before the start date", async () => {
    renderComponent();
    fillDates("2026-01-10", "2026-01-01");

    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    expect(
      await screen.findByText("End date must not be before start date"),
    ).toBeInTheDocument();
    expect(axiosMock.history.get.length).toBe(0);
  });

  test("accepts an end date equal to the start date (a one-day period)", async () => {
    axiosMock.onGet("/api/participationgrade/compute").reply(200, []);
    renderComponent();
    fillDates("2026-01-01", "2026-01-01");

    // A 1-day period can't satisfy the default n=5 for criterion 2; disable
    // it here since that's not what this test is checking.
    fireEvent.change(screen.getByTestId(`${testid}-criterion1Weight`), {
      target: { value: "80" },
    });
    fireEvent.change(screen.getByTestId(`${testid}-criterion2Weight`), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    await waitFor(() => expect(axiosMock.history.get.length).toBe(1));
    expect(
      screen.queryByText("End date must not be before start date"),
    ).not.toBeInTheDocument();
  });

  test("rejects a criterion2MinDays outside the period, when criterion 2 is enabled", async () => {
    renderComponent();
    fillDates("2026-01-01", "2026-01-05"); // 5-day period

    fireEvent.change(screen.getByTestId(`${testid}-criterion2MinDays`), {
      target: { value: "6" },
    });
    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    expect(
      await screen.findByText(
        "n must be between 1 and 5 (the number of days in the period)",
      ),
    ).toBeInTheDocument();
    expect(axiosMock.history.get.length).toBe(0);
  });

  test("rejects a criterion2MinDays of 0", async () => {
    renderComponent();
    fillDates("2026-01-01", "2026-01-05"); // 5-day period

    fireEvent.change(screen.getByTestId(`${testid}-criterion2MinDays`), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    expect(
      await screen.findByText(
        "n must be between 1 and 5 (the number of days in the period)",
      ),
    ).toBeInTheDocument();
    expect(axiosMock.history.get.length).toBe(0);
  });

  test.each([
    ["the lower boundary", "1"],
    ["the upper boundary", "5"],
  ])(
    "accepts a criterion2MinDays of %s (n=%s) for a 5-day period",
    async (_label, n) => {
      axiosMock.onGet("/api/participationgrade/compute").reply(200, []);
      renderComponent();
      fillDates("2026-01-01", "2026-01-05"); // 5-day period

      fireEvent.change(screen.getByTestId(`${testid}-criterion2MinDays`), {
        target: { value: n },
      });
      fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

      await waitFor(() => expect(axiosMock.history.get.length).toBe(1));
      expect(
        screen.queryByText(
          "n must be between 1 and 5 (the number of days in the period)",
        ),
      ).not.toBeInTheDocument();
    },
  );

  test("does not flag criterion2MinDays as invalid when criterion 2 is enabled but no date range is set yet", async () => {
    renderComponent();

    fireEvent.change(screen.getByTestId(`${testid}-criterion2MinDays`), {
      target: { value: "999" },
    });
    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    // Wait for the validation pass to actually finish (evidenced by the
    // startDate error, since no dates were filled in) before checking
    // criterion2MinDays - otherwise this assertion runs before react-hook-form
    // has resolved anything and passes trivially either way.
    await screen.findByText("Start date is required");

    expect(screen.getByTestId(`${testid}-criterion2MinDays`)).not.toHaveClass(
      "is-invalid",
    );
  });

  test.each(["criterion1Weight", "criterion2Weight"])(
    "shows a required error when %s is cleared",
    async (field) => {
      renderComponent();
      fillDates("2026-01-01", "2026-01-10");

      fireEvent.change(screen.getByTestId(`${testid}-${field}`), {
        target: { value: "" },
      });
      fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

      await waitFor(() =>
        expect(screen.getByTestId(`${testid}-${field}`)).toHaveClass(
          "is-invalid",
        ),
      );
      expect(axiosMock.history.get.length).toBe(0);
    },
  );

  test("shows a required error (not the sum-to-100 message) when criterion3Weight is cleared", async () => {
    renderComponent();
    fillDates("2026-01-01", "2026-01-10");

    fireEvent.change(screen.getByTestId(`${testid}-criterion3Weight`), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    await waitFor(() =>
      expect(screen.getByTestId(`${testid}-criterion3Weight`)).toHaveClass(
        "is-invalid",
      ),
    );
    // required fires before the sumsTo100 validator ever runs, so its
    // message should not be the one shown.
    expect(screen.queryByText(/must sum to 100/)).not.toBeInTheDocument();
    expect(axiosMock.history.get.length).toBe(0);
  });

  test("shows a required error (not the range message) when criterion2MinDays is cleared", async () => {
    renderComponent();
    fillDates("2026-01-01", "2026-01-10");

    fireEvent.change(screen.getByTestId(`${testid}-criterion2MinDays`), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    await waitFor(() =>
      expect(screen.getByTestId(`${testid}-criterion2MinDays`)).toHaveClass(
        "is-invalid",
      ),
    );
    // required fires before the inRange validator ever runs, so its message
    // should not be the one shown.
    expect(screen.queryByText(/n must be between/)).not.toBeInTheDocument();
    expect(axiosMock.history.get.length).toBe(0);
  });

  test("submitting a changed criterion2MinDays sends it as a number, not a string", async () => {
    axiosMock.onGet("/api/participationgrade/compute").reply(200, []);
    renderComponent();
    fillDates("2026-01-01", "2026-01-10");

    fireEvent.change(screen.getByTestId(`${testid}-criterion2MinDays`), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    await waitFor(() => expect(axiosMock.history.get.length).toBe(1));
    expect(axiosMock.history.get[0].params.criterion2MinDays).toBe(3);
  });

  test("does not validate criterion2MinDays against the period when criterion 2 is disabled", async () => {
    axiosMock.onGet("/api/participationgrade/compute").reply(200, []);
    renderComponent();
    fillDates("2026-01-01", "2026-01-05"); // 5-day period

    fireEvent.change(screen.getByTestId(`${testid}-criterion2Weight`), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByTestId(`${testid}-criterion1Weight`), {
      target: { value: "80" },
    });
    fireEvent.change(screen.getByTestId(`${testid}-criterion2MinDays`), {
      target: { value: "999" },
    });
    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    await waitFor(() => expect(axiosMock.history.get.length).toBe(1));
  });

  test("submits the form, renders the results table, and shows a summary toast", async () => {
    const grades = [
      {
        studentId: 10,
        perm: "1111111",
        lastName: "Gaucho",
        firstMiddleName: "Chris",
        interactedAtLeastOnce: true,
        daysInteracted: 3,
        ownedAndCheckedInOnACow: true,
        criterion1PointsEarned: 40,
        criterion2PointsEarned: 24,
        criterion3PointsEarned: 20,
        totalPointsEarned: 84,
      },
      {
        studentId: 20,
        perm: "2222222",
        lastName: "Delgado",
        firstMiddleName: "Jamie",
        interactedAtLeastOnce: false,
        daysInteracted: 0,
        ownedAndCheckedInOnACow: false,
        criterion1PointsEarned: 0,
        criterion2PointsEarned: 0,
        criterion3PointsEarned: 0,
        totalPointsEarned: 0,
      },
    ];
    axiosMock.onGet("/api/participationgrade/compute").reply(200, grades);

    renderComponent();
    fillDates("2026-01-01", "2026-01-10");
    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    await waitFor(() => expect(axiosMock.history.get.length).toBe(1));

    expect(axiosMock.history.get[0].url).toBe(
      "/api/participationgrade/compute",
    );
    expect(axiosMock.history.get[0].params).toMatchObject({
      courseId: 1,
      startDate: "2026-01-01",
      endDate: "2026-01-10",
      criterion1Weight: 40,
      criterion2Weight: 40,
      criterion2MinDays: 5,
      criterion2PartialCredit: false,
      criterion3Weight: 20,
      totalPoints: 100,
    });

    expect(
      await screen.findByTestId(`${testid}-table-cell-row-0-col-perm`),
    ).toHaveTextContent("1111111");
    expect(
      screen.getByTestId(
        `${testid}-table-cell-row-0-col-interactedAtLeastOnce`,
      ),
    ).toHaveTextContent("Yes");
    expect(
      screen.getByTestId(
        `${testid}-table-cell-row-0-col-ownedAndCheckedInOnACow`,
      ),
    ).toHaveTextContent("Yes");
    expect(
      screen.getByTestId(
        `${testid}-table-cell-row-1-col-interactedAtLeastOnce`,
      ),
    ).toHaveTextContent("No");
    expect(
      screen.getByTestId(
        `${testid}-table-cell-row-1-col-ownedAndCheckedInOnACow`,
      ),
    ).toHaveTextContent("No");

    expect(mockToast).toHaveBeenCalledWith("Computed grades for 2 student(s).");
  });

  test("shows a Download CSV button with a matching query string only after a successful preview", async () => {
    axiosMock.onGet("/api/participationgrade/compute").reply(200, []);
    renderComponent();
    fillDates("2026-01-01", "2026-01-10");
    fireEvent.click(screen.getByTestId(`${testid}-preview-button`));

    const downloadButton = await screen.findByTestId(
      `${testid}-download-button`,
    );
    const href = downloadButton.getAttribute("href");

    expect(href).toContain("/api/participationgrade/download?");
    expect(href).toContain("courseId=1");
    expect(href).toContain("startDate=2026-01-01");
    expect(href).toContain("endDate=2026-01-10");
    expect(href).toContain("criterion1Weight=40");
    expect(href).toContain("totalPoints=100");
  });
});
