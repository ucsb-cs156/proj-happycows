import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";
import { act } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useNavigate } from "react-router";
import { useCurrentUser, useLogout, hasRole } from "main/utils/currentUser";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { vi } from "vitest";

import {
  apiCurrentUserFixtures,
  currentUserFixtures,
} from "fixtures/currentUserFixtures";

vi.mock("react-router");
const { MemoryRouter } = await vi.importActual("react-router");

describe("utils/currentUser tests", () => {
  describe("useCurrentUser tests", () => {
    test("useCurrentUser retrieves initial data", async () => {
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
      axiosMock.onGet("/api/currentUser").timeout();
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper,
      });
      await waitFor(() => result.current.isSuccess);

      expect(result.current.data).toEqual({
        loggedIn: false,
        root: null,
        initialData: true,
      });
      const queryState = queryClient.getQueryState("/api/currentUser");
      expect(queryState).toBeDefined();
    });

    test("useCurrentUser retrieves data from API", async () => {
      const queryClient = new QueryClient();
      const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      var axiosMock = new AxiosMockAdapter(axios);
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper,
      });

      // Wait for the query to successfully fetch from the API
      await waitFor(() => result.current.isSuccess);

      expect(result.current.data).toEqual(currentUserFixtures.userOnly);
      queryClient.clear();
      axiosMock.restore();
    });

    test("useCurrentUser when API unreachable", async () => {
      const queryClient = new QueryClient();
      const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      var axiosMock = new AxiosMockAdapter(axios);
      axiosMock.onGet("/api/currentUser").reply(404);

      const restoreConsole = mockConsole();
      const { result } = renderHook(() => useCurrentUser(), {
        wrapper,
      });

      await waitFor(() => result.current.isFetched);
      expect(console.error).toHaveBeenCalled();
      const errorMessage = console.error.mock.calls[0][0];
      expect(errorMessage).toMatch(/Error invoking axios.get:/);
      restoreConsole();

      await waitFor(() =>
        expect(result.current.data).toEqual({ loggedIn: false, root: null }),
      );
      queryClient.clear();
      axiosMock.restore();
    });

    test("useCurrentUser handles missing roles correctly", async () => {
      const queryClient = new QueryClient();
      const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const apiResult = apiCurrentUserFixtures.missingRolesToTestErrorHandling;
      var axiosMock = new AxiosMockAdapter(axios);
      axiosMock.onGet("/api/currentUser").reply(200, apiResult);

      const restoreConsole = mockConsole();
      const { result } = renderHook(() => useCurrentUser(), {
        wrapper,
      });

      await waitFor(() => result.current.isFetched);
      expect(console.error).toHaveBeenCalled();
      const errorMessage = console.error.mock.calls[0][0];
      expect(errorMessage).toMatch(/Error getting roles: /);
      restoreConsole();

      let expectedResult = {
        loggedIn: true,
        root: { ...apiResult, rolesList: ["ERROR_GETTING_ROLES"] },
      };
      await waitFor(() => expect(result.current.data).toEqual(expectedResult));
      queryClient.clear();
    });
  });

  describe("useLogout tests", () => {
    test("useLogout", async () => {
      const queryClient = new QueryClient();
      const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>{children}</MemoryRouter>
        </QueryClientProvider>
      );

      var axiosMock = new AxiosMockAdapter(axios);
      axiosMock.onPost("/logout").reply(200);

      const navigateSpy = vi.fn();
      useNavigate.mockImplementation(() => navigateSpy);

      const resetQueriesSpy = vi.spyOn(queryClient, "resetQueries");

      const { result } = renderHook(() => useLogout(), { wrapper });

      act(() => {
        expect(useNavigate).toHaveBeenCalled();
        result.current.mutate();
      });
      await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/"));

      await waitFor(() =>
        expect(resetQueriesSpy).toHaveBeenCalledWith("/api/currentUser", {
          exact: true,
        }),
      );

      queryClient.clear();
    });
  });
  describe("hasRole tests", () => {
    test('hasRole(x,"ROLE_ADMIN") return falsy when currentUser ill-defined', async () => {
      expect(hasRole(null, "ROLE_ADMIN")).toBeFalsy();
      expect(hasRole({}, "ROLE_ADMIN")).toBeFalsy();
      expect(hasRole({ loggedIn: null }, "ROLE_ADMIN")).toBeFalsy();
      expect(hasRole({ loggedIn: true }, "ROLE_ADMIN")).toBeFalsy();
      expect(hasRole({ loggedIn: true, root: null }, "ROLE_ADMIN")).toBeFalsy();
      expect(hasRole({ loggedIn: true, root: {} }, "ROLE_ADMIN")).toBeFalsy();
      expect(
        hasRole({ loggedIn: true, root: { rolesList: null } }, "ROLE_ADMIN"),
      ).toBeFalsy();
    });

    test('hasRole(x,"ROLE_ADMIN") returns correct values when currentUser properly defined', async () => {
      expect(
        hasRole({ loggedIn: true, root: { rolesList: [] } }, "ROLE_ADMIN"),
      ).toBeFalsy();
      expect(
        hasRole(
          { loggedIn: true, root: { rolesList: ["ROLE_USER"] } },
          "ROLE_ADMIN",
        ),
      ).toBeFalsy();
      expect(
        hasRole(
          { loggedIn: true, root: { rolesList: ["ROLE_USER", "ROLE_ADMIN"] } },
          "ROLE_ADMIN",
        ),
      ).toBeTruthy();
    });
  });
});
