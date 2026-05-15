import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router";
import RecordCommonStatsForm from "main/components/Jobs/RecordCommonStatsForm";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi } from "vitest";

// Next line uses technique from https://www.chakshunyu.com/blog/how-to-spy-on-a-named-import-in-jest/

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("RecordCommonStatsForm tests", () => {

  //Test 1: Component renders without crashing
  it("renders the fallback text correctlyl", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <RecordCommonStatsForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(screen.getByText(/Record statistics for all commons/i)).toBeInTheDocument();
    expect(screen.getByText("RecordCommonStatsForm-Submit-Button")).toBeInTheDocument();
  });
  //Test 2: Submit button is present and clickable
  it("user can sucessfully submit the job", async () => {
    const submitAction = vi.fn();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <RecordCommonStatsForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );
    const submitButton = screen.getByTestId("RecordCommonStatsForm-Submit-Button");
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(submitAction).toHaveBeenCalled();
    })
  });
});
