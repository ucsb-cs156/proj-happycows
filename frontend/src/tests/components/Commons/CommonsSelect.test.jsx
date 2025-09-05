import { render, screen } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router";
import CommonsSelect from "main/components/Commons/CommonsSelect";
import { QueryClient, QueryClientProvider } from "react-query";
import commonsFixtures from "fixtures/commonsFixtures";
import { vi } from "vitest";

describe("CommonsSelect tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultTestId = "CommonsSelect";

  it("renders correctly", async () => {
    const commons = commonsFixtures.threeCommons;

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <CommonsSelect
            commons={commons}
            handleCommonsSelection={() => {}}
            selectedCommons={{}}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId(`${defaultTestId}-CommonsSelect-div`),
    ).toBeInTheDocument();
  });
});
