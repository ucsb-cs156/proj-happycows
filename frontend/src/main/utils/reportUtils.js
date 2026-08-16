import { toast } from "react-toastify";

export function onDeleteSuccess(message) {
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsDeleteReport(cell) {
  return {
    url: "/api/reports",
    method: "DELETE",
    params: {
      reportId: cell.row.values.id,
    },
  };
}

export function cellToAxiosParamsPurgeReports(cell) {
  return {
    url: "/api/reports/purge",
    method: "DELETE",
    params: {
      reportId: cell.row.values.id,
    },
  };
}
