import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import StaffForm from "main/components/Staff/StaffForm";
import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/staffUtils";
import { hasRole } from "main/utils/currentUser";
import { toast } from "react-toastify";

export default function StaffTable({
  staff,
  currentUser,
  courseId,
  testid = "StaffTable",
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cellToDelete, setCellToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState(null);

  const queryKey = [`/api/staff/course/${courseId}`];

  const editCallback = (cell) => {
    setStaffToEdit(cell.row.original);
    setShowEditModal(true);
  };

  const cellToAxiosParamsEdit = (staffMember) => ({
    url: `/api/staff/${staffToEdit.id}`,
    method: "PUT",
    data: { ...staffMember, courseId },
  });

  const onEditSuccess = () => {
    toast("Staff member updated successfully.");
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
        <Modal.Title>Edit Staff</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <StaffForm
          initialContents={staffToEdit}
          submitAction={submitEditForm}
          buttonLabel="Update"
          cancelDisabled={true}
        />
      </Modal.Body>
    </Modal>
  );

  const staffModal = (
    <Modal
      data-testid="StaffTable-Modal"
      show={showDeleteModal}
      onHide={() => setShowDeleteModal(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete this staff member?
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          data-testid="StaffTable-Modal-Cancel"
          onClick={() => setShowDeleteModal(false)}
        >
          Keep this Staff Member
        </Button>
        <Button
          variant="danger"
          data-testid="StaffTable-Modal-Delete"
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
        data={staff}
        columns={columnsToDisplay}
        testid={testid}
        centered={false}
      />
      {hasRole(currentUser, "ROLE_ADMIN") && editModal}
      {hasRole(currentUser, "ROLE_ADMIN") && staffModal}
    </>
  );
}
