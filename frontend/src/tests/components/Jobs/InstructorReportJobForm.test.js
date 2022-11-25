import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import InstructorReportJobForm from "main/components/Jobs/InstructorReportJobForm";
import jobsFixtures from "fixtures/jobsFixtures";

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}));

describe("InstructorReportJobForm tests", () => {
  it("renders correctly with the right defaults", async () => {
    render(
      <Router >
        <InstructorReportJobForm jobs={jobsFixtures.sixJobs}/>
      </Router>
    );

    expect(await screen.findByTestId("InstructorReportJobForm-fail")).toBeInTheDocument();
    expect(await screen.findByTestId("InstructorReportJobForm-sleepMs")).toBeInTheDocument();
    expect(screen.getByText(/Submit/)).toBeInTheDocument();
  });


  it("has validation errors for required fields", async () => {
    const submitAction = jest.fn();

    render(
      <Router  >
        <InstructorReportJobForm jobs={jobsFixtures.sixJobs}/>
      </Router  >
    );

    expect(await screen.findByTestId("InstructorReportJobForm-fail")).toBeInTheDocument();
    const submitButton = screen.getByTestId("InstructorReportJobForm-Submit-Button");
    const sleepMs = screen.getByTestId("InstructorReportJobForm-sleepMs");

    expect(submitButton).toBeInTheDocument();
    expect(sleepMs).toHaveValue(1000);

    fireEvent.change(sleepMs, { target: { value: '70000' } })
    fireEvent.click(submitButton);
    expect(await screen.findByText(/sleepMs may not be/i)).toBeInTheDocument();
    expect(submitAction).not.toBeCalled();
  });
});
