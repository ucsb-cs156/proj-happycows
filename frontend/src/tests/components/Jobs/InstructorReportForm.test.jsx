import { render, screen } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router-dom";
import InstructorReportForm from "main/components/Jobs/InstructorReportForm";
import jobsFixtures from "fixtures/jobsFixtures";
import { vi } from "vitest";

const mockedNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("InstructorReportForm tests", () => {
  it("button generates correctly", async () => {
    render(
      <Router>
        <InstructorReportForm jobs={jobsFixtures.formJob} />
      </Router>,
    );
    const submitButton = screen.getByTestId("InstructorReport-Submit-Button");
    expect(submitButton).toBeInTheDocument();
  });
});
