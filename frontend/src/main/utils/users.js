import { useQuery } from "react-query";
import axios from "axios";
import { useBackendMutation } from "./useBackend";

export function useUsers() {
  return useQuery(
    "users",
    async () => {
      const uri = "/api/admin/users";
      try {
        const response = await axios.get(uri);
        return response.data;
      } catch (e) {
        console.error(`Error getting data from ${uri}:`, e);
        return [];
      }
    },
    {
      initialData: [],
    },
  );
}

export function useSuspendUser() {
  return useBackendMutation(
    (cell) => ({
      method: "post",
      url: "/api/admin/users/suspend",
      params: { userId: cell.row.values.id },
    }),
    {},
    // Stryker disable next-line all : hard to set up test for query key invalidation for mutations
    "users",
  );
}

export function useRestoreUser() {
  return useBackendMutation(
    (cell) => ({
      method: "post",
      url: "/api/admin/users/restore",
      params: { userId: cell.row.values.id },
    }),
    {},
    // Stryker disable next-line all : hard to set up test for query key invalidation for mutations
    "users",
  );
}
