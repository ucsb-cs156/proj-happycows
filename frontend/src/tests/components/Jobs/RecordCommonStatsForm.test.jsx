import { render, screen } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router";
import RecordCommonStatsForm from "main/components/Jobs/RecordCommonStatsForm";
import { vi } from "vitest";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("RecordCommonStatsForm tests", () => {
  it("button generates correctly", async () => {
    const mockSubmit = vi.fn();
    render(
      <Router>
        <RecordCommonStatsForm submitAction={mockSubmit} />
      </Router>,
    );
    const submitButton = screen.getByTestId("RecordCommonStats-Submit-Button");
    expect(submitButton).toBeInTheDocument();
  });
});
