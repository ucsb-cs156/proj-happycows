import { toast } from "react-toastify";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import StaffCSVUploadForm from "main/components/Staff/StaffCSVUploadForm";
import StaffForm from "main/components/Staff/StaffForm";
import StaffTable from "main/components/Staff/StaffTable";

// The Staff tab of a course's admin page: adding staff (individually or via
// CSV roster upload) is scoped to this courseId, not a free-standing admin
// page with a course-picker. See issue #251.
export default function StaffTabComponent({ courseId, currentUser }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  const queryKey = [`/api/staff/course/${courseId}`];

  // Stryker disable all
  const { data: staff } = useBackend(
    queryKey,
    { method: "GET", url: `/api/staff/course/${courseId}` },
    [],
  );
  // Stryker restore all

  const objectToAxiosParamsAdd = (staffMember) => ({
    url: "/api/staff",
    method: "POST",
    data: { ...staffMember, courseId },
  });

  const onAddSuccess = () => {
    toast("Staff member added successfully.");
    setShowAddModal(false);
  };

  const addMutation = useBackendMutation(
    objectToAxiosParamsAdd,
    { onSuccess: onAddSuccess },
    queryKey,
  );

  const submitAddForm = (data) => {
    addMutation.mutate(data);
  };

  const objectToAxiosParamsCsv = (formData) => {
    const file = new FormData();
    file.append("file", formData.upload[0]);
    return {
      url: "/api/staff/upload/csv",
      method: "POST",
      params: { courseId },
      data: file,
    };
  };

  const onCsvSuccess = (result) => {
    const skipped = result.skippedEmails.length;
    const skippedMessage = skipped
      ? `, ${skipped} skipped (already on roster)`
      : "";
    toast(
      `Roster uploaded: ${result.created} staff member(s) added${skippedMessage}.`,
    );
    setShowCsvModal(false);
  };

  const csvMutation = useBackendMutation(
    objectToAxiosParamsCsv,
    { onSuccess: onCsvSuccess },
    queryKey,
  );

  const submitCsvForm = (formData) => {
    csvMutation.mutate(formData);
  };

  return (
    <div data-testid="StaffTabComponent">
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Individual Staff Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StaffForm submitAction={submitAddForm} cancelDisabled={true} />
        </Modal.Body>
      </Modal>
      <Modal show={showCsvModal} onHide={() => setShowCsvModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload CSV Roster</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StaffCSVUploadForm submitAction={submitCsvForm} />
        </Modal.Body>
      </Modal>
      <Button
        variant="primary"
        className="mb-3 me-2"
        data-testid="StaffTabComponent-add-button"
        onClick={() => setShowAddModal(true)}
      >
        Add Individual Staff Member
      </Button>
      <Button
        variant="secondary"
        className="mb-3"
        data-testid="StaffTabComponent-csv-button"
        onClick={() => setShowCsvModal(true)}
      >
        Upload CSV Roster
      </Button>
      <StaffTable staff={staff} currentUser={currentUser} courseId={courseId} />
    </div>
  );
}
