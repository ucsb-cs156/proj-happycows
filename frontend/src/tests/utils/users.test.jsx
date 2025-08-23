import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";
import { QueryClient, QueryClientProvider } from "react-query";
import { useRestoreUser, useSuspendUser, useUsers } from "main/utils/users";
import usersFixtures from "fixtures/usersFixtures";
import { act } from "react";
import { vi } from "vitest";

vi.mock("react-router-dom");

describe("utils/users tests", () => {
  describe("useUsers tests", () => {
    test("useUsers initially retrieves initial data on timeout", async () => {
      const queryClient = new QueryClient();
      const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      var axiosMock = new AxiosMockAdapter(axios);
      axiosMock.onGet("/api/admin/users").timeout();

      const restoreConsole = mockConsole();

      const { result } = renderHook(() => useUsers(), { wrapper });

      await waitFor(() => result.current.isSuccess);
      expect(result.current.data).toEqual([]);

      const queryState = queryClient.getQueryState("users");
      expect(queryState).toBeDefined();

      await waitFor(() => expect(console.error).toHaveBeenCalled());
      const errorMessage = console.error.mock.calls[0][0];
      expect(errorMessage).toMatch("Error getting data from /api/admin/users:");
      restoreConsole();
    });

    test("useUsers hits error logic on 404", async () => {
      const queryClient = new QueryClient();
      const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      var axiosMock = new AxiosMockAdapter(axios);
      axiosMock.onGet("/api/admin/users").reply(404);

      const restoreConsole = mockConsole();

      const { result } = renderHook(() => useUsers(), { wrapper });
      await waitFor(() => result.current.isFetched);
      expect(console.error).toHaveBeenCalled();
      restoreConsole();

      expect(result.current.data).toEqual([]);
    });

    test("useUsers returns correct data when api is mocked", async () => {
      const queryClient = new QueryClient();
      const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
      var axiosMock = new AxiosMockAdapter(axios);
      axiosMock.onGet("/api/admin/users").reply(200, usersFixtures.threeUsers);

      const { result } = renderHook(() => useUsers(), { wrapper });
      await waitFor(() => result.current.isFetched);
      expect(result.current.data).toEqual(usersFixtures.threeUsers);
    });
  });

  describe("suspendUser tests", () => {
    var axiosMock;
    beforeEach(() => {
      vi.spyOn(console, "error").mockImplementation();
      axiosMock = new AxiosMockAdapter(axios);
      queryClient.prefetchQuery("users", async () => {
        return [];
      });
    });

    afterEach(() => {
      axiosMock.restore();
      console.error.mockRestore();
    });

    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    test("suspendUser posts to correct endpoint on successful request", async () => {
      axiosMock
        .onPost("/api/admin/users/suspend")
        .reply(200, "User with id 1 suspended");

      const userCell = { row: { values: { id: 1 } } };
      const { result } = renderHook(() => useSuspendUser(), {
        wrapper,
      });

      act(() => {
        result.current.mutate(userCell);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      const queryState = queryClient.getQueryState("users");
      expect(queryState).toBeDefined();
      expect(result.current.data).toEqual("User with id 1 suspended");
      expect(axiosMock.history.post[0].params).toEqual({ userId: 1 });
    });
  });

  describe("restoreUser tests", () => {
    var axiosMock;
    beforeEach(() => {
      vi.spyOn(console, "error").mockImplementation();
      axiosMock = new AxiosMockAdapter(axios);
      queryClient.prefetchQuery("users", async () => {
        return [];
      });
    });

    afterEach(() => {
      axiosMock.restore();
      console.error.mockRestore();
    });

    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    test("restoreUser posts to correct endpoint on success request", async () => {
      axiosMock
        .onPost("/api/admin/users/restore")
        .reply(200, "User with id 1 restored");

      const userCell = { row: { values: { id: 1 } } };
      const { result } = renderHook(() => useRestoreUser(), {
        wrapper,
      });

      act(() => {
        result.current.mutate(userCell);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      const queryState = queryClient.getQueryState("users");
      expect(queryState).toBeDefined();
      expect(result.current.data).toEqual("User with id 1 restored");
      expect(axiosMock.history.post[0].params).toEqual({ userId: 1 });
    });
  });
});
