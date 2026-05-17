import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/announcementUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/currentUser";
import { formatDateTime } from "main/utils/dateUtils";

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
      accessor: "id",
    },
    {
      Header: "Start Date",
      accessor: "startDate",
      Cell: ({ value }) => formatDateTime(value),
    },
    {
      Header: "End Date",
      accessor: "endDate",
      Cell: ({ value }) => formatDateTime(value),
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

  columns.push({
    Header: "Announcement",
    accessor: "announcementText",
    width: 400,
    Cell: ({ value }) => (
      <div
        style={{
          whiteSpace: "normal",
          wordBreak: "break-word",
          maxWidth: "400px",
        }}
      >
        {value}
      </div>
    ),
  });

  return (
    <OurTable
      data={announcements}
      columns={columns}
      testid={"AnnouncementTable"}
    />
  );
}
