import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/courseUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/currentUser";

export default function CoursesTable({
  courses,
  currentUser,
  testIdPrefix = "CoursesTable",
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/admin/courses/edit/${cell.row.values.id}`);
  };

  // Stryker disable all : hard to test query caching
  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    [`/api/course/all`],
  );
  // Stryker restore all

  // Stryker disable next-line all : tested through useBackendMutation behavior
  const deleteCallback = (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      Header: "id",
      accessor: "id",
    },
    {
      Header: "Code",
      accessor: "code",
    },
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Term",
      accessor: "term",
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn("Edit", "primary", editCallback, testIdPrefix),
    );
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, testIdPrefix),
    );
  }

  return (
    <OurTable
      data={courses}
      columns={columns}
      testid={testIdPrefix}
    />
  );
}
