import { toast } from "react-toastify";

export function onDeleteSuccess(message) {
  toast(message.message);
}

export function cellToAxiosParamsDelete(cell) {
  return {
    url: `/api/course/${cell.row.values.id}`,
    method: "DELETE",
  };
}
