import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import StaffForm from "main/components/Staff/StaffForm";
import { staffFixtures } from "fixtures/staffFixtures";
import { vi } from "vitest";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("StaffForm tests", () => {
  const expectedHeaders = ["Last Name", "First/Middle Name", "Email"];
  const testId = "StaffForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <Router>
        <StaffForm />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <Router>
        <StaffForm initialContents={staffFixtures.oneStaff[0]} />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <StaffForm />
      </Router>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("the Cancel button is hidden when cancelDisabled is true", async () => {
    render(
      <Router>
        <StaffForm cancelDisabled={true} />
      </Router>,
    );

    expect(await screen.findByTestId(`${testId}-submit`)).toBeInTheDocument();
    expect(screen.queryByTestId(`${testId}-cancel`)).not.toBeInTheDocument();
  });

  test("that the correct validations are performed", async () => {
    render(
      <Router>
        <StaffForm />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Last name is required./);
    expect(
      screen.getByText(/First\/Middle name is required./),
    ).toBeInTheDocument();
    expect(screen.getByText(/Email is required./)).toBeInTheDocument();
  });
});
