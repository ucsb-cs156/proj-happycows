import { renderHook } from "@testing-library/react-hooks";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";
import { QueryClient, QueryClientProvider } from "react-query";

import { restoreUser, suspendUser, useUsers } from "main/utils/users";
import usersFixtures from "fixtures/usersFixtures";

jest.mock("react-router-dom");

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

      const { result, waitFor } = renderHook(() => useUsers(), { wrapper });

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

      const { result, waitFor } = renderHook(() => useUsers(), { wrapper });
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

      const { result, waitFor } = renderHook(() => useUsers(), { wrapper });
      await waitFor(() => result.current.isFetched);
      expect(result.current.data).toEqual(usersFixtures.threeUsers);
    });
  });

  describe("suspendUser tests", () => {
    var axiosMock;
    beforeEach(() => {
      jest.spyOn(console, "error").mockImplementation();
      axiosMock = new AxiosMockAdapter(axios);
    });

    afterEach(() => {
      axiosMock.restore();
      console.error.mockRestore();
    });

    test("suspendUser posts to correct endpoint on successful request", async () => {
      axiosMock
        .onPost("/api/admin/users/suspend")
        .reply(200, "User with id 1 suspended");

      const user = { id: 1 }; // Simulating user data
      const response = await suspendUser({ row: { values: user } });
      expect(response).toEqual("User with id 1 suspended");
      expect(axiosMock.history.post[0].params).toEqual({ userId: 1 });
    });

    test("suspendUser hits error logic on 404 error", async () => {
      axiosMock.onPost("/api/admin/users/suspend").reply(404);
      let result;
      const user = { id: 1 };
      try {
        result = suspendUser({ row: { values: user } });
      } catch (e) {
        expect(error.response.status).toBe(404);
        expect(console.error).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          `Error suspending user with id ${user.id} from /api/admin/users/suspend`,
          expect.anything()
        );
        expect(result).toEqual([]);
      }
    });
    test("suspendUser returns empty array on failure", async () => {
      var axiosMock = new AxiosMockAdapter(axios);
      axiosMock.onPost("/api/admin/users/suspend").networkError();

      const user = { id: 1 };
      const response = await suspendUser({ row: { values: user } }).catch(
        (e) => e
      );

      expect(response).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        `Error suspending user with id ${user.id} from /api/admin/users/suspend`,
        expect.anything()
      );
    });
  });

  describe("restoreUser tests", () => {
    var axiosMock;
    beforeEach(() => {
      jest.spyOn(console, "error").mockImplementation();
      axiosMock = new AxiosMockAdapter(axios);
    });

    afterEach(() => {
      axiosMock.restore();
      console.error.mockRestore();
    });

    test("restoreUser posts to correct endpoint on success request", async () => {
      axiosMock
        .onPost("/api/admin/users/restore")
        .reply(200, "User with id 1 restored");

      const user = { id: 1 }; // Simulating user data
      const response = await restoreUser({ row: { values: user } });
      expect(response).toEqual("User with id 1 restored");
      expect(axiosMock.history.post[0].params).toEqual({ userId: 1 });
    });

    test("restoreUser hits error logic on 404 error", async () => {
      axiosMock.onPost("/api/admin/users/restore").reply(404);
      let result;
      const user = { id: 1 };
      try {
        result = restoreUser({ row: { values: user } });
      } catch (e) {
        expect(error.response.status).toBe(404);
        expect(console.error).toHaveBeenCalledWith(
          `Error restoring user with id ${user.id} from /api/admin/users/restore`,
          expect.anything()
        );
        expect(result).toEqual([]);
      }
    });

    test("restoreUser returns empty array on failure", async () => {
      var axiosMock = new AxiosMockAdapter(axios);
      axiosMock.onPost("/api/admin/users/restore").networkError();

      const user = { id: 1 };
      const response = await restoreUser({ row: { values: user } }).catch(
        (e) => e
      );

      expect(response).toEqual([]); // Ensure that it returns an empty array on error
      expect(console.error).toHaveBeenCalledWith(
        `Error restoring user with id ${user.id} from /api/admin/users/restore`,
        expect.anything()
      );
    });
  });
});
