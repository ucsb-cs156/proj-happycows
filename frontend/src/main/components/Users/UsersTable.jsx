import React, { useState } from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { formatTime } from "main/utils/dateUtils";
import { useRestoreUser, useSuspendUser } from "main/utils/users";
import { Button, Modal } from "react-bootstrap";

export default function UsersTable({ users }) {
  const { mutate: suspendUser } = useSuspendUser();
  const { mutate: restoreUser } = useRestoreUser();
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  const suspendCallback = async (cell) => {
    setSelectedCell(cell);
    setShowSuspendModal(true);
  };

  const restoreCallback = async (cell) => {
    setSelectedCell(cell);
    setShowRestoreModal(true);
  };

  const confirmSuspend = async () => {
    suspendUser(selectedCell);
    setShowSuspendModal(false);
  };

  const confirmRestore = async () => {
    restoreUser(selectedCell);
    setShowRestoreModal(false);
  };

  const columns = [
    {
      Header: "id",
      accessor: "id", // accessor is the "key" in the data
    },
    {
      Header: "First Name",
      accessor: "givenName",
    },
    {
      Header: "Last Name",
      accessor: "familyName",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Last Online",
      id: "lastOnline",
      accessor: (row) => formatTime(row.lastOnline),
    },
    {
      Header: "Admin",
      id: "admin",
      accessor: (row, _rowIndex) => String(row.admin), // hack needed for boolean values to show up
    },
    {
      Header: "Suspended",
      id: "suspended",
      accessor: (row, _rowIndex) => String(row.suspended), // hack needed for boolean values to show up
    },
    ButtonColumn("Suspend", "danger", suspendCallback, "UsersTable"),
    ButtonColumn("Restore", "primary", restoreCallback, "UsersTable"),
  ];

  const suspendModal = (
    <Modal show={showSuspendModal} onHide={() => setShowSuspendModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Suspend User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to suspend {selectedCell?.row.values.email}?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowSuspendModal(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={confirmSuspend}>
          Confirm Suspend
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const restoreModal = (
    <Modal show={showRestoreModal} onHide={() => setShowRestoreModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Restore User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to restore {selectedCell?.row.values.email}?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowRestoreModal(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={confirmRestore}>
          Confirm Restore
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <>
      <OurTable data={users} columns={columns} testid={"UsersTable"} />
      {suspendModal}
      {restoreModal}
    </>
  );
}
