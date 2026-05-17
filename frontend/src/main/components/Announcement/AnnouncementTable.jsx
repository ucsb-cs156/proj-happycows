import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/announcementUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/currentUser";

export default function AnnouncementTable({
  announcements,
  currentUser,
  commonsId,
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/admin/announcements/${commonsId}/edit/${cell.row.values.id}`);
  };

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    [`/api/announcements/getbycommonsid?commonsId=${commonsId}`],
  );

  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      Header: "id",
      accessor: "id", // accessor is the "key" in the data
    },
    {
      Header: "Start Date ISO Format",
      accessor: "startDate",
    },
    {
      Header: "End Date ISO Format",
      accessor: "endDate",
    },
    {
      Header: "Announcement",
      accessor: "announcementText",
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn("Edit", "primary", editCallback, "AnnouncementTable"),
    );
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "AnnouncementTable"),
    );
  }

  return (
    <OurTable
      data={announcements}
      columns={columns}
      testid={"AnnouncementTable"}
    />
  );
}
