import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/studentUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/currentUser";

export default function StudentsTable({
  students,
  currentUser,
  testid = "StudentsTable",
}) {
  const [showModal, setShowModal] = useState(false);
  const [cellToDelete, setCellToDelete] = useState(null);

  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/admin/editstudents/${cell.row.values.id}`);
  };

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/student/all"],
  );

  const deleteCallback = async (cell) => {
    setCellToDelete(cell);
    setShowModal(true);
  };

  const confirmDelete = async (cell) => {
    deleteMutation.mutate(cell);
    setShowModal(false);
  };

  const columns = [
    {
      Header: "id",
      accessor: "id",
    },
    {
      Header: "Last Name",
      accessor: "lastName",
    },
    {
      Header: "First/Middle Name",
      accessor: "firstMiddleName",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Perm",
      accessor: "perm",
    },
    {
      Header: "Course Id",
      accessor: "courseId",
    },
  ];

  const columnsIfAdmin = [
    ...columns,
    ButtonColumn("Edit", "primary", editCallback, testid),
    ButtonColumn("Delete", "danger", deleteCallback, testid),
  ];

  const columnsToDisplay = hasRole(currentUser, "ROLE_ADMIN")
    ? columnsIfAdmin
    : columns;

  const studentsModal = (
    <Modal
      data-testid="StudentsTable-Modal"
      show={showModal}
      onHide={() => setShowModal(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this student?</Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          data-testid="StudentsTable-Modal-Cancel"
          onClick={() => setShowModal(false)}
        >
          Keep this Student
        </Button>
        <Button
          variant="danger"
          data-testid="StudentsTable-Modal-Delete"
          onClick={() => confirmDelete(cellToDelete)}
        >
          Permanently Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <>
      <OurTable data={students} columns={columnsToDisplay} testid={testid} />
      {hasRole(currentUser, "ROLE_ADMIN") && studentsModal}
    </>
  );
}
