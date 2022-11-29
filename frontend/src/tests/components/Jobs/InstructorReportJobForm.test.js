import {render, screen } from "@testing-library/react";
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
    expect(screen.getByText(/Submit/)).toBeInTheDocument();
  });
});
