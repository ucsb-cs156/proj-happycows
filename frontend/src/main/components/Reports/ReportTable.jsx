import React, { useState } from "react";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import PageSizeSelector from "main/components/Utils/PageSizeSelector";
import usePageSize from "main/utils/usePageSize";
import { useNavigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDeleteReport,
  cellToAxiosParamsPurgeReports,
  onDeleteSuccess,
} from "main/utils/reportUtils";

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200, 500];
const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_STORAGE_KEY = "reports-page-size";

// should take in a players list from a game
export default function ReportTable({
  reports,
  storybook = false,
  buttons = true,
}) {
  const testid = "ReportTable";

  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [cellToDelete, setCellToDelete] = useState(null);
  const [cellToPurge, setCellToPurge] = useState(null);

  const [pageSize, handlePageSizeChange] = usePageSize({
    storageKey: PAGE_SIZE_STORAGE_KEY,
    options: PAGE_SIZE_OPTIONS,
    defaultPageSize: DEFAULT_PAGE_SIZE,
  });

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDeleteReport,
    { onSuccess: onDeleteSuccess },
    ["/api/reports"],
  );

  const purgeMutation = useBackendMutation(
    cellToAxiosParamsPurgeReports,
    { onSuccess: onDeleteSuccess },
    ["/api/reports"],
  );

  const reportCallback = (cell) => {
    const route = `/admin/report/${cell.row.values["id"]}`;
    if (storybook) {
      window.alert(`would navigate to ${route}`);
    } else {
      navigate(route);
    }
  };

  const deleteCallback = (cell) => {
    setCellToDelete(cell);
    setShowDeleteModal(true);
  };

  const purgeCallback = (cell) => {
    setCellToPurge(cell);
    setShowPurgeModal(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(cellToDelete);
    setShowDeleteModal(false);
  };

  const confirmPurge = () => {
    purgeMutation.mutate(cellToPurge);
    setShowPurgeModal(false);
  };

  const columns = [
    {
      Header: "id",
      accessor: "id",
    },
    {
      Header: "gameId",
      accessor: "gameId",
      Cell: (props) => {
        return <div style={{ textAlign: "right" }}>{props.value}</div>;
      },
    },
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Create Date",
      accessor: "createDate",
    },
    {
      Header: "Num Users",
      accessor: "numUsers",
      Cell: (props) => {
        return <div style={{ textAlign: "right" }}>{props.value}</div>;
      },
    },
    {
      Header: "Num Cows",
      accessor: "numCows",
      Cell: (props) => {
        return <div style={{ textAlign: "right" }}>{props.value}</div>;
      },
    },
  ];

  if (buttons) {
    columns.push(
      ButtonColumn("View Report", "secondary", reportCallback, testid),
    );
    columns.push({
      Header: "Delete Report",
      Cell: ({ cell }) => (
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip>
              Deletes the current report (along with all detail rows pertaining
              to it)
            </Tooltip>
          }
        >
          <Button
            variant="danger"
            onClick={() => deleteCallback(cell)}
            data-testid={`${testid}-cell-row-${cell.row.index}-col-${cell.column.id}-button`}
          >
            Delete Report
          </Button>
        </OverlayTrigger>
      ),
    });
    columns.push({
      Header: "Purge Older Reports",
      Cell: ({ cell }) => (
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip>
              Keeps this report, but purges all reports older than this one
            </Tooltip>
          }
        >
          <Button
            variant="warning"
            onClick={() => purgeCallback(cell)}
            data-testid={`${testid}-cell-row-${cell.row.index}-col-${cell.column.id}-button`}
          >
            Purge Older Reports
          </Button>
        </OverlayTrigger>
      ),
    });
  }

  const sortBy = [{ id: "createDate", desc: true }];

  return (
    <>
      <PageSizeSelector
        value={pageSize}
        onChange={handlePageSizeChange}
        options={PAGE_SIZE_OPTIONS}
        testid={`${testid}-page-size-selector`}
      />
      <OurTable
        data={reports}
        columns={columns}
        testid={testid}
        pageSize={pageSize}
        initialState={{ sortBy }}
      />
      <Modal
        data-testid={`${testid}-DeleteModal`}
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this report, along with all detail
          rows pertaining to it? This cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            data-testid={`${testid}-DeleteModal-Cancel`}
            onClick={() => setShowDeleteModal(false)}
          >
            Keep this Report
          </Button>
          <Button
            variant="danger"
            data-testid={`${testid}-DeleteModal-Delete`}
            onClick={confirmDelete}
          >
            Permanently Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        data-testid={`${testid}-PurgeModal`}
        show={showPurgeModal}
        onHide={() => setShowPurgeModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Purge</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to purge all reports older than this one? This
          keeps this report, but permanently deletes all older reports. This
          cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            data-testid={`${testid}-PurgeModal-Cancel`}
            onClick={() => setShowPurgeModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="warning"
            data-testid={`${testid}-PurgeModal-Purge`}
            onClick={confirmPurge}
          >
            Purge Older Reports
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
