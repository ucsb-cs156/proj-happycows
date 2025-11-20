import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";
import { QueryClient, QueryClientProvider } from "react-query";
import { useSystemInfo } from "main/utils/systemInfo";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { vi } from "vitest";

vi.mock("react-router");

describe("utils/systemInfo tests", () => {
  describe("useSystemInfo tests", () => {
    test("useSystemInfo retrieves initial data", async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: Infinity,
          },
        },
      });
      const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      var axiosMock = new AxiosMockAdapter(axios);
      axiosMock.onGet("/api/systemInfo").timeoutOnce();
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);

      const { result } = renderHook(() => useSystemInfo(), {
        wrapper,
      });
      await waitFor(() => result.current.isSuccess);

      //expect(result.current.data).toEqual({
      //  initialData: true,
      //  springH2ConsoleEnabled: false,
      //  showSwaggerUILink: false,
      //});
      expect(result.current.data.springH2ConsoleEnabled).toBe(false);
      expect(result.current.data.showSwaggerUILink).toBe(false);

      const queryState = queryClient.getQueryState("systemInfo");
      expect(queryState).toBeDefined();
    });

    test("useSystemInfo retrieves data from API", async () => {
      const queryClient = new QueryClient();
      const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      var axiosMock = new AxiosMockAdapter(axios);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingAll);

      const { result } = renderHook(() => useSystemInfo(), {
        wrapper,
      });

      await waitFor(() => result.current.isFetched);

      //expect(result.current.data).toEqual(systemInfoFixtures.showingAll);
      expect(result.current.data.springH2ConsoleEnabled).toBe(
        systemInfoFixtures.showingAll.springH2ConsoleEnabled,
      );

      expect(result.current.data.showSwaggerUILink).toBe(
        systemInfoFixtures.showingAll.showSwaggerUILink,
      );

      expect(result.current.data.oauthLogin).toBe(
        systemInfoFixtures.showingAll.oauthLogin,
      );

      expect(result.current.data.sourceRepo).toBe(
        systemInfoFixtures.showingAll.sourceRepo,
      );

      queryClient.clear();
    });

    test("systemInfo when API unreachable", async () => {
      const queryClient = new QueryClient();
      const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      var axiosMock = new AxiosMockAdapter(axios);
      axiosMock.onGet("/api/systemInfo").reply(404);

      const restoreConsole = mockConsole();
      const { result } = renderHook(() => useSystemInfo(), {
        wrapper,
      });

      await waitFor(() => result.current.isFetched);
      expect(console.error).toHaveBeenCalled();
      const errorMessage = console.error.mock.calls[0][0];
      expect(errorMessage).toMatch(/Error invoking axios.get:/);
      restoreConsole();

      await waitFor(() =>
        expect(result.current.data).toEqual({
          springH2ConsoleEnabled: false,
          showSwaggerUILink: false,
        }),
      );
      queryClient.clear();
    });
  });
});
