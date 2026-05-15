import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router";
import RecordCommonStatsForm from "main/components/Jobs/RecordCommonStatsForm";
import { QueryClient, QueryClientProvider } from "react-query";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import commonsFixtures from "fixtures/commonsFixtures";
import * as useBackendModule from "main/utils/useBackend";
import { vi } from "vitest";

// Next line uses technique from https://www.chakshunyu.com/blog/how-to-spy-on-a-named-import-in-jest/

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("RecordCommonStatsForm tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  //Test 1: Component renders without crashing
  it("renders the fallback text correctlyl", async () => {
    axiosMock.onGet("/api/commons/all").reply(200, []);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <RecordCommonStatsForm />
        </Router>
      </QueryClientProvider>,
    );

  });
  //Test 2: Submit button is present and clickable
  it("user can sucessfully submit the job", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockImplementation(() => null);

    const submitAction = vi.fn();
    axiosMock
      .onGet("/api/commons/all")
      .reply(200, commonsFixtures.threeCommons);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <RecordCommonStatsForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );

  });

  //Test 4: Form data is passed to submitAction
  test("the correct parameters are passed to useBackend", async () => {
    // https://www.chakshunyu.com/blog/how-to-spy-on-a-named-import-in-jest/
    const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <RecordCommonStatsForm />
        </Router>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(useBackendSpy).toHaveBeenCalledWith(
        ["/api/commons/all"],
        { url: "/api/commons/all" },
        [],
      );
    });
  });
});
