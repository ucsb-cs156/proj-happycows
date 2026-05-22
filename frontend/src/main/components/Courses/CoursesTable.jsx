import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import OurTable, {
  ButtonColumn,
  HrefButtonColumn,
} from "main/components/OurTable";
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
  testid = "CoursesTable",
}) {
  const [showModal, setShowModal] = useState(false);
  const [cellToDelete, setCellToDelete] = useState(null);

  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/admin/editcourses/${cell.row.values.id}`);
  };

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/course/all"],
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

  const columnsIfAdmin = [
    ...columns,
    ButtonColumn("Edit", "primary", editCallback, testid),
    ButtonColumn("Delete", "danger", deleteCallback, testid),
  ];

  const columnsToDisplay = hasRole(currentUser, "ROLE_ADMIN")
    ? columnsIfAdmin
    : columns;

  const coursesModal = (
    <Modal
      data-testid="CoursesTable-Modal"
      show={showModal}
      onHide={() => setShowModal(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this course?</Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          data-testid="CoursesTable-Modal-Cancel"
          onClick={() => setShowModal(false)}
        >
          Keep this Course
        </Button>
        <Button
          variant="danger"
          data-testid="CoursesTable-Modal-Delete"
          onClick={() => confirmDelete(cellToDelete)}
        >
          Permanently Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <>
      <OurTable data={courses} columns={columnsToDisplay} testid={testid} />
      {hasRole(currentUser, "ROLE_ADMIN") && coursesModal}
    </>
  );
}
