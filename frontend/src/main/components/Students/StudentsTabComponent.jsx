import { toast } from "react-toastify";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import StudentsCSVUploadForm from "main/components/Students/StudentsCSVUploadForm";
import StudentsForm from "main/components/Students/StudentsForm";
import StudentsTable from "main/components/Students/StudentsTable";

// The Students tab of a course's admin page: adding students (individually
// or via CSV roster upload) is scoped to this courseId, not a free-standing
// admin page with a course-picker. See issue #251.
export default function StudentsTabComponent({ courseId, currentUser }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  const queryKey = [`/api/student/course/${courseId}`];

  // Stryker disable all
  const { data: students } = useBackend(
    queryKey,
    { method: "GET", url: `/api/student/course/${courseId}` },
    [],
  );
  // Stryker restore all

  const objectToAxiosParamsAdd = (student) => ({
    url: "/api/student",
    method: "POST",
    data: { ...student, courseId },
  });

  const onAddSuccess = () => {
    toast("Student added successfully.");
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
      url: "/api/student/upload/csv",
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
      `Roster uploaded: ${result.created} student(s) added${skippedMessage}.`,
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
    <div data-testid="StudentsTabComponent">
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Individual Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StudentsForm submitAction={submitAddForm} cancelDisabled={true} />
        </Modal.Body>
      </Modal>
      <Modal show={showCsvModal} onHide={() => setShowCsvModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload CSV Roster</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StudentsCSVUploadForm submitAction={submitCsvForm} />
        </Modal.Body>
      </Modal>
      <Button
        variant="primary"
        className="mb-3 me-2"
        data-testid="StudentsTabComponent-add-button"
        onClick={() => setShowAddModal(true)}
      >
        Add Individual Student
      </Button>
      <Button
        variant="secondary"
        className="mb-3"
        data-testid="StudentsTabComponent-csv-button"
        onClick={() => setShowCsvModal(true)}
      >
        Upload CSV Roster
      </Button>
      <StudentsTable
        students={students}
        currentUser={currentUser}
        courseId={courseId}
      />
    </div>
  );
}
