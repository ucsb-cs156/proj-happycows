import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import StudentsForm from "main/components/Students/StudentsForm";
import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/studentUtils";
import { hasRole } from "main/utils/currentUser";
import { toast } from "react-toastify";

export default function StudentsTable({
  students,
  currentUser,
  courseId,
  testid = "StudentsTable",
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cellToDelete, setCellToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);

  const queryKey = [`/api/student/course/${courseId}`];

  const editCallback = (cell) => {
    setStudentToEdit(cell.row.original);
    setShowEditModal(true);
  };

  const cellToAxiosParamsEdit = (student) => ({
    url: `/api/student/${studentToEdit.id}`,
    method: "PUT",
    data: { ...student, courseId },
  });

  const onEditSuccess = () => {
    toast("Student updated successfully.");
    setShowEditModal(false);
  };

  const editMutation = useBackendMutation(
    cellToAxiosParamsEdit,
    { onSuccess: onEditSuccess },
    queryKey,
  );

  const submitEditForm = (data) => {
    editMutation.mutate(data);
  };

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    queryKey,
  );

  const deleteCallback = async (cell) => {
    setCellToDelete(cell);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (cell) => {
    deleteMutation.mutate(cell);
    setShowDeleteModal(false);
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
  ];

  const columnsIfAdmin = [
    ...columns,
    ButtonColumn("Edit", "primary", editCallback, testid),
    ButtonColumn("Delete", "danger", deleteCallback, testid),
  ];

  const columnsToDisplay = hasRole(currentUser, "ROLE_ADMIN")
    ? columnsIfAdmin
    : columns;

  const editModal = (
    <Modal
      data-testid={`${testid}-EditModal`}
      show={showEditModal}
      onHide={() => setShowEditModal(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>Edit Student</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <StudentsForm
          initialContents={studentToEdit}
          submitAction={submitEditForm}
          buttonLabel="Update"
          cancelDisabled={true}
        />
      </Modal.Body>
    </Modal>
  );

  const studentsModal = (
    <Modal
      data-testid="StudentsTable-Modal"
      show={showDeleteModal}
      onHide={() => setShowDeleteModal(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this student?</Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          data-testid="StudentsTable-Modal-Cancel"
          onClick={() => setShowDeleteModal(false)}
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
      <OurTable
        data={students}
        columns={columnsToDisplay}
        testid={testid}
        centered={false}
      />
      {hasRole(currentUser, "ROLE_ADMIN") && editModal}
      {hasRole(currentUser, "ROLE_ADMIN") && studentsModal}
    </>
  );
}
