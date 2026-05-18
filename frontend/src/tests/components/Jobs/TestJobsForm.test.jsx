import userEvent from "@testing-library/user-event";
import { MemoryRouter as Router } from "react-router";
import TestJobsForm from "main/components/Jobs/TestJobForm";
import jobsFixtures from "fixtures/jobsFixtures";
import { vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("TestJobsForm tests", () => {
  it("renders correctly with the right defaults", async () => {
    render(
      <Router>
        <TestJobsForm jobs={jobsFixtures.sixJobs} />
      </Router>,
    );

    expect(await screen.findByTestId("TestJobForm-fail")).toBeInTheDocument();
    expect(
      await screen.findByTestId("TestJobForm-sleepMs"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Submit/)).toBeInTheDocument();
  });

  it("validates that sleepMs is present", async () => {
    const submitAction = vi.fn();

    render(
      <Router>
        <TestJobsForm submitAction={submitAction} jobs={jobsFixtures.sixJobs} />
      </Router>,
    );

    expect(await screen.findByTestId("TestJobForm-fail")).toBeInTheDocument();

    const submitButton = screen.getByTestId("TestJobForm-Submit-Button");
    const sleepMs = screen.getByTestId("TestJobForm-sleepMs");

    expect(submitButton).toBeInTheDocument();
    expect(sleepMs).toHaveValue(1000);

    await userEvent.clear(sleepMs);
    await userEvent.click(submitButton);

    expect(
      await screen.findByText("sleepMs is required (0 is ok)"),
    ).toBeInTheDocument();
    expect(submitAction).not.toBeCalled();
    expect(screen.getByTestId("TestJobForm-sleepMs")).toHaveClass("is-invalid");
  });

  it("validates that sleepMs is >= 0", async () => {
    const submitAction = vi.fn();

    render(
      <Router>
        <TestJobsForm submitAction={submitAction} jobs={jobsFixtures.sixJobs} />
      </Router>,
    );

    expect(await screen.findByTestId("TestJobForm-fail")).toBeInTheDocument();

    const submitButton = screen.getByTestId("TestJobForm-Submit-Button");
    const sleepMs = screen.getByTestId("TestJobForm-sleepMs");

    expect(submitButton).toBeInTheDocument();
    expect(sleepMs).toHaveValue(1000);

    fireEvent.change(sleepMs, { target: { value: "-100" } });
    expect(sleepMs).toHaveValue(-100);

    fireEvent.click(submitButton);

    expect(
      await screen.findByText(/sleepMs must be positive/i),
    ).toBeInTheDocument();
    expect(submitAction).not.toBeCalled();
  });

  it("validates that sleepMs is <= 60000", async () => {
    const submitAction = vi.fn();

    render(
      <Router>
        <TestJobsForm submitAction={submitAction} jobs={jobsFixtures.sixJobs} />
      </Router>,
    );

    expect(await screen.findByTestId("TestJobForm-fail")).toBeInTheDocument();

    const submitButton = screen.getByTestId("TestJobForm-Submit-Button");
    const sleepMs = screen.getByTestId("TestJobForm-sleepMs");

    expect(submitButton).toBeInTheDocument();
    expect(sleepMs).toHaveValue(1000);

    await userEvent.clear(sleepMs);
    await userEvent.type(sleepMs, "70000");
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/sleepMs must be ≤ 60000/i),
    ).toBeInTheDocument();
    expect(submitAction).not.toBeCalled();
  });
});
