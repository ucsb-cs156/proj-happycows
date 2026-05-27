import { toast } from "react-toastify";

export function onDeleteSuccess(message) {
  console.log(message);
  toast(`Announcement deleted - id: ${message.id}`);
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

export function toBackendDateTime(dateTimeString) {
  if (!dateTimeString) {
    return undefined;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date(dateTimeString));
}
