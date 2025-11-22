import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { vi } from "vitest";

import DeveloperPage from "main/pages/DeveloperPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const mockInspector = vi.fn(({ data }) => (
  <div data-testid="mock-inspector">{JSON.stringify(data)}</div>
));

vi.mock("react-inspector", () => ({
  Inspector: (props) => mockInspector(props),
}));

describe("DeveloperPage tests", () => {
  const queryClient = new QueryClient();
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    mockInspector.mockClear();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingAll);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
  });

  test("renders branch information text and forwards system info to Inspector", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DeveloperPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Github Branch Information"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The following SystemInfo is displayed in a JSON file."),
    ).toBeInTheDocument();

    const inspectorDiv = await screen.findByTestId("mock-inspector");
    await waitFor(() => {
      expect(inspectorDiv).toHaveTextContent(
        systemInfoFixtures.showingAll.sourceRepo,
      );
    });

    await waitFor(() => expect(mockInspector).toHaveBeenCalled());
    const inspectorProps = mockInspector.mock.calls.at(-1)[0];
    expect(inspectorProps.data).toEqual(systemInfoFixtures.showingAll);
  });
});
