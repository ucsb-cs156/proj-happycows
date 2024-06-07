import React,  {useState} from "react";
import OurTable, {ButtonColumn} from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import { cellToAxiosParamsSuspend, onSuspendSuccess, cellToAxiosParamsRestore, onRestoreSuccess } from "main/utils/usersUtils"
import { hasRole } from "main/utils/currentUser";
import { formatTime } from "main/utils/dateUtils";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export default function UsersTable({ users, currentUser }) {

    const [showModalSuspend, setShowModalSuspend] = useState(false);
    const [cellToSuspend, setCellToSuspend] = useState(null);
    const [showModalRestore, setShowModalRestore] = useState(false);
    const [cellToRestore, setCellToRestore] = useState(null);

    // Stryker disable all : hard to test for query caching
    const suspendMutation = useBackendMutation(
        cellToAxiosParamsSuspend,
        { onSuccess: onSuspendSuccess },
        ["/api/admin/users"]
    );
    // Stryker restore all 

    // Stryker disable next-line all : TODO try to make a good test for this
    const suspendCallback = async (cell) => {
        setCellToSuspend(cell);
        setShowModalSuspend(true);
    }

    const confirmSuspend = async (cell) => {
        suspendMutation.mutate(cell);
        setShowModalSuspend(false);
    };

    // Stryker disable all : hard to test for query caching
    const restoreMutation = useBackendMutation(
        cellToAxiosParamsRestore,
        { onSuccess: onRestoreSuccess },
        ["/api/admin/users"]
    );
    // Stryker restore all 

    // Stryker disable next-line all : TODO try to make a good test for this
    const restoreCallback = async (cell) => {
        setCellToRestore(cell);
        setShowModalRestore(true);
    }

    const confirmRestore = async (cell) => {
        restoreMutation.mutate(cell);
        setShowModalRestore(false);
    };

    const columns = [
        {
            Header: 'id',
            accessor: 'id', // accessor is the "key" in the data
        },
        {
            Header: 'First Name',
            accessor: 'givenName',
        },
        {
            Header: 'Last Name',
            accessor: 'familyName',
        },
        {
            Header: 'Email',
            accessor: 'email',
        },
        {
            Header: 'Last Online',
            id: 'lastOnline',
            accessor: (row) => formatTime(row.lastOnline),
        },
        {
            Header: 'Admin',
            id: 'admin',
            accessor: (row, _rowIndex) => String(row.admin) // hack needed for boolean values to show up
        },
        {
            Header: 'Suspended',
            id: 'suspended',
            accessor: (row, _rowIndex) => String(row.suspended) // hack needed for boolean values to show up
        },
    ];

    const testid = "UsersTable";

    const columnsIfAdmin = [
        ...columns,
        ButtonColumn("Suspend", "danger", suspendCallback, testid),
        ButtonColumn("Restore", "success", restoreCallback, testid),
    ];

    const columnsToDisplay = hasRole(currentUser,"ROLE_ADMIN") ? columnsIfAdmin : columns;

    const usersModalSuspend = (
        <Modal data-testid="UsersTable-Modal" show={showModalSuspend} onHide={() => setShowModalSuspend(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Suspension</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to suspend this user?            
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" data-testid="UsersTable-SuspendModal-Cancel" onClick={() => setShowModalSuspend(false)}>
                    Leave this User as is
                </Button>
                <Button variant="danger" data-testid="UsersTable-Modal-Suspend" onClick={() => confirmSuspend(cellToSuspend)}>
                    Suspend this User
                </Button>
            </Modal.Footer>
        </Modal> );

    const usersModalRestore = (
        <Modal data-testid="UsersTable-Modal" show={showModalRestore} onHide={() => setShowModalRestore(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Restoration</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to restore this user?            
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" data-testid="UsersTable-RestoreModal-Cancel" onClick={() => setShowModalRestore(false)}>
                    Leave this User as is
                </Button>
                <Button variant="success" data-testid="UsersTable-Modal-Restore" onClick={() => confirmRestore(cellToRestore)}>
                    Restore this User
                </Button>
            </Modal.Footer>
        </Modal> );

    return (
    <>
        <OurTable
            data={users}
            columns={columnsToDisplay}
            testid={testid}
        />
        {hasRole(currentUser,"ROLE_ADMIN") && usersModalSuspend}
        {hasRole(currentUser,"ROLE_ADMIN") && usersModalRestore}
    </>);

};