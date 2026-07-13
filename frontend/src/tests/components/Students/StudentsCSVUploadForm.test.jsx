import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StudentsCSVUploadForm from "main/components/Students/StudentsCSVUploadForm";
import { vi } from "vitest";

describe("StudentsCSVUploadForm tests", () => {
  test("renders correctly", () => {
    render(<StudentsCSVUploadForm submitAction={vi.fn()} />);

    expect(
      screen.getByText("Upload Student Roster (.csv)"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("StudentsCSVUploadForm-upload"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("StudentsCSVUploadForm-submit"),
    ).toBeInTheDocument();
  });

  test("shows a validation error when no file is chosen", async () => {
    const submitAction = vi.fn();
    render(<StudentsCSVUploadForm submitAction={submitAction} />);

    fireEvent.click(screen.getByTestId("StudentsCSVUploadForm-submit"));

    await screen.findByText("A CSV file is required.");
    expect(submitAction).not.toHaveBeenCalled();
  });

  test("calls submitAction with the chosen file", async () => {
    const submitAction = vi.fn();
    render(<StudentsCSVUploadForm submitAction={submitAction} />);

    const file = new File(
      ["lastName,firstMiddleName,email,perm"],
      "roster.csv",
      {
        type: "text/csv",
      },
    );
    const input = screen.getByTestId("StudentsCSVUploadForm-upload");
    await userEvent.upload(input, file);

    fireEvent.click(screen.getByTestId("StudentsCSVUploadForm-submit"));

    await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));
    const submittedData = submitAction.mock.calls[0][0];
    expect(submittedData.upload[0]).toBe(file);
  });
});
