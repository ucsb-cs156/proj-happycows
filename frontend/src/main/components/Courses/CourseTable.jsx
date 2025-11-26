import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/courseUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/currentUser";

export default function CourseTable({ courses, currentUser }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/course/edit/${cell.row.original.id}`);
  };

  // Stryker disable all : hard to test for query caching

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/course/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      Header: "id",
      accessor: "id", // accessor is the "key" in the data
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
    columns.push(ButtonColumn("Edit", "primary", editCallback, "CourseTable"));
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "CourseTable"),
    );
  }

  return <OurTable data={courses} columns={columns} testid={"CourseTable"} />;
}
