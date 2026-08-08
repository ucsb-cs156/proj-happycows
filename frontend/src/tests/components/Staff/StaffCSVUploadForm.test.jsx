import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StaffCSVUploadForm from "main/components/Staff/StaffCSVUploadForm";
import { vi } from "vitest";

describe("StaffCSVUploadForm tests", () => {
  test("renders correctly", () => {
    render(<StaffCSVUploadForm submitAction={vi.fn()} />);

    expect(screen.getByText("Upload Staff Roster (.csv)")).toBeInTheDocument();
    expect(screen.getByTestId("StaffCSVUploadForm-upload")).toBeInTheDocument();
    expect(screen.getByTestId("StaffCSVUploadForm-submit")).toBeInTheDocument();
  });

  test("shows a validation error when no file is chosen", async () => {
    const submitAction = vi.fn();
    render(<StaffCSVUploadForm submitAction={submitAction} />);

    fireEvent.click(screen.getByTestId("StaffCSVUploadForm-submit"));

    await screen.findByText("A CSV file is required.");
    expect(submitAction).not.toHaveBeenCalled();
  });

  test("calls submitAction with the chosen file", async () => {
    const submitAction = vi.fn();
    render(<StaffCSVUploadForm submitAction={submitAction} />);

    const file = new File(["lastName,firstMiddleName,email"], "staff.csv", {
      type: "text/csv",
    });
    const input = screen.getByTestId("StaffCSVUploadForm-upload");
    await userEvent.upload(input, file);

    fireEvent.click(screen.getByTestId("StaffCSVUploadForm-submit"));

    await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));
    const submittedData = submitAction.mock.calls[0][0];
    expect(submittedData.upload[0]).toBe(file);
  });
});
