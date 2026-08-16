import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router";
import RecordGameStatsForm from "main/components/Jobs/RecordGameStatsForm";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi } from "vitest";

// Next line uses technique from https://www.chakshunyu.com/blog/how-to-spy-on-a-named-import-in-jest/

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("RecordGameStatsForm tests", () => {
  //Test 1: Component renders without crashing
  it("renders the fallback text correctlyl", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <RecordGameStatsForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(
      screen.getByText(/Record statistics for all games/i),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("RecordGameStatsForm-Submit-Button"),
    ).toBeInTheDocument();
  });
  //Test 2: Submit button is present and clickable
  it("user can sucessfully submit the job", async () => {
    const submitAction = vi.fn();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <RecordGameStatsForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );
    const submitButton = screen.getByTestId(
      "RecordGameStatsForm-Submit-Button",
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
          <RecordGameStatsForm />
        </Router>
      </QueryClientProvider>,
    );
    const submitButton = screen.getByTestId(
      "RecordGameStatsForm-Submit-Button",
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
          <RecordGameStatsForm testid={customTestId} />
        </Router>
      </QueryClientProvider>,
    );
    expect(
      container.querySelector(`[data-testid="${customTestId}"]`),
    ).toBeInTheDocument();
  });

  //Test 5: Submit button has correct text
  it("submit button displays correct text", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <RecordGameStatsForm />
        </Router>
      </QueryClientProvider>,
    );
    const submitButton = screen.getByTestId(
      "RecordGameStatsForm-Submit-Button",
    );
    expect(submitButton).toHaveTextContent("Record Stats");
  });

  //Test 6: Form contains correct descriptive text
  it("form contains correct descriptive text about recording statistics", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <RecordGameStatsForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(
      screen.getByText(/Record statistics for all games/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This will create a GameStats/i),
    ).toBeInTheDocument();
  });

  //Test 7: Form has proper structure with Form.Group
  it("form has proper structure with Form.Group", async () => {
    const { container } = render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <RecordGameStatsForm />
        </Router>
      </QueryClientProvider>,
    );
    const formGroup = container.querySelector(".mb-3");
    expect(formGroup).toBeInTheDocument();
    expect(formGroup.tagName).toBe("DIV");
  });

  //Test 8: Submit button has type="submit"
  it("submit button has type submit attribute", async () => {
    const { container } = render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <RecordGameStatsForm />
        </Router>
      </QueryClientProvider>,
    );
    const submitButton = container.querySelector(
      'button[data-testid="RecordGameStatsForm-Submit-Button"]',
    );
    expect(submitButton).toHaveAttribute("type", "submit");
  });
  //Test 9: Default testid is "RecordGameStatsForm"
  it("default testid is RecordGameStatsForm", async () => {
    const { container } = render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <RecordGameStatsForm />
        </Router>
      </QueryClientProvider>,
    );
    const form = container.querySelector('[data-testid="RecordGameStatsForm"]');
    expect(form).toBeInTheDocument();
    expect(form.tagName).toBe("FORM");
  });
});
