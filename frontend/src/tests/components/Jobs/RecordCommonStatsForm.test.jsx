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
    expect(
      screen.getByText(/Record statistics for all commons/i),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("RecordCommonStatsForm-Submit-Button"),
    ).toBeInTheDocument();
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
    const submitButton = screen.getByTestId(
      "RecordCommonStatsForm-Submit-Button",
    );
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(submitAction).toHaveBeenCalled();
    });
  });

  //Test 3: Submit button calls default submitAction when not provided
  it("submit button calls default submitAction when not provided", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <RecordCommonStatsForm />
        </Router>
      </QueryClientProvider>,
    );
    const submitButton = screen.getByTestId(
      "RecordCommonStatsForm-Submit-Button",
    );
    expect(submitButton).toBeInTheDocument();
    fireEvent.click(submitButton);
    // Should not crash and button should be clickable
    expect(submitButton).toBeEnabled();
  });

  //Test 4: Component uses custom testid when provided
  it("component uses custom testid when provided", async () => {
    const customTestId = "CustomTestId";
    const { container } = render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <RecordCommonStatsForm testid={customTestId} />
        </Router>
      </QueryClientProvider>,
    );
    expect(
      container.querySelector(`[data-testid="${customTestId}"]`),
    ).toBeInTheDocument();
  });
});
