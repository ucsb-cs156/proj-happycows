import { toast } from "react-toastify";

export function cellToAxiosParamsSuspend(cell) {
    return {
        url: "/api/admin/users/suspend",
        method: "POST",
        params: {
            id: cell.row.values.id
        }
    }
}

export function onSuspendSuccess(message) {
    console.log(message);
    toast(message);
}

export function cellToAxiosParamsRestore(cell) {
    return {
        url: "/api/admin/users/restore",
        method: "POST",
        params: {
            id: cell.row.values.id
        }
    }
}

export function onRestoreSuccess(message) {
    console.log(message);
    toast(message);
}