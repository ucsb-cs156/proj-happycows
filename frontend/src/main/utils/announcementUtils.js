import { toast } from "react-toastify";

export const ANNOUNCEMENT_TEXT_MAX_LENGTH = 255;

// datetime-local inputs use "YYYY-MM-DDTHH:mm"; Spring ISO.DATE_TIME expects seconds.
export function datetimeLocalToIsoDateTime(value) {
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
  ) {
    return `${value}:00`;
  }
  return value;
}

export function onDeleteSuccess(message) {
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsDelete(cell) {
  return {
    url: "/api/announcements/delete",
    method: "DELETE",
    params: {
      id: cell.row.values.id,
    },
  };
}
