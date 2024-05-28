import { useQuery } from "react-query";
import axios from "axios";

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
    }
  );
}

export async function suspendUser(cell) {
  const uri = "/api/admin/users/suspend";
  const user = cell.row.values;
  try {
    const response = await axios.post(
      uri,
      {},
      {
        params: {
          userId: user.id,
        },
      }
    );
    return response.data;
  } catch (e) {
    console.error(`Error suspending user with id ${user.id} from ${uri}`, e);
    return [];
  }
}

export async function restoreUser(cell) {
  const uri = "/api/admin/users/restore";
  const user = cell.row.values;
  try {
    const response = await axios.post(
      uri,
      {},
      {
        params: {
          userId: user.id,
        },
      }
    );
    return response.data;
  } catch (e) {
    console.error(`Error restoring user with id ${user.id} from ${uri}`, e);
    return [];
  }
}
