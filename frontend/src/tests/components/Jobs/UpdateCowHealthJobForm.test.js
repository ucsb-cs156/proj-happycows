import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import UpdateCowHealthForm from "main/components/Jobs/UpdateCowHealthJobForm";
import jobsFixtures from "fixtures/jobsFixtures";

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}));

describe("UpdateCowHealthForm tests", () => {
  it("renders correctly with the right defaults", async () => {
    render(
      <Router >
        <UpdateCowHealthForm jobs={jobsFixtures.sixJobs}/>
      </Router>
    );

    expect(await screen.findByTestId("UpdateCowHealthJobForm-fail")).toBeInTheDocument();
    expect(await screen.findByTestId("UpdateCowHealthJobForm-sleepMs")).toBeInTheDocument();
    expect(screen.getByText(/Submit/)).toBeInTheDocument();
  });


  it("has validation errors for required fields", async () => {
    const submitAction = jest.fn();

    render(
      <Router  >
        <UpdateCowHealthForm jobs={jobsFixtures.sixJobs}/>
      </Router  >
    );

    expect(await screen.findByTestId("UpdateCowHealthJobForm-fail")).toBeInTheDocument();
    const submitButton = screen.getByTestId("UpdateCowHealthJobForm-Submit-Button");
    const sleepMs = screen.getByTestId("UpdateCowHealthJobForm-sleepMs");

    expect(submitButton).toBeInTheDocument();
    expect(sleepMs).toHaveValue(1000);

    fireEvent.change(sleepMs, { target: { value: '70000' } })
    fireEvent.click(submitButton);
    expect(await screen.findByText(/sleepMs may not be/i)).toBeInTheDocument();
    expect(submitAction).not.toBeCalled();
  });
});
