import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UsersTable from "main/components/Users/UsersTable";
import { formatTime } from "main/utils/dateUtils";
import usersFixtures from "fixtures/usersFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

jest.mock("main/utils/users", () => ({
  suspendUser: jest.fn(),
  restoreUser: jest.fn(),
}));

describe("UserTable tests", () => {
  test("renders without crashing for empty table", () => {
    render(<UsersTable users={[]} />);
  });

  test("renders without crashing for three users", () => {
    render(<UsersTable users={usersFixtures.threeUsers} />);
  });

  test("Has the expected colum headers and content", () => {
    render(<UsersTable users={usersFixtures.threeUsers} />);

    const expectedHeaders = [
      "id",
      "First Name",
      "Last Name",
      "Email",
      "Last Online",
      "Admin",
      "Suspended",
    ];
    const expectedFields = [
      "id",
      "givenName",
      "familyName",
      "email",
      "lastOnline",
      "admin",
      "suspended",
    ];
    const testId = "UsersTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1"
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-admin`)
    ).toHaveTextContent("true");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-lastOnline`)
    ).toHaveTextContent(formatTime(usersFixtures.threeUsers[0].lastOnline));
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-suspended`)
    ).toHaveTextContent("false");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Suspend-button`)
    ).toHaveClass("btn-danger");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Restore-button`)
    ).toHaveClass("btn-primary");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2"
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-admin`)
    ).toHaveTextContent("false");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-suspended`)
    ).toHaveTextContent("true");
  });
});

describe("Modal tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Clicking Suspend button opens the modal for suspendUser", async () => {
    render(<UsersTable users={usersFixtures.threeUsers} />);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    const suspendButtons = screen.getAllByText("Suspend");
    fireEvent.click(suspendButtons[1]);

    await waitFor(() => {
      expect(document.body).toHaveClass("modal-open");
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          "Are you sure you want to suspend " +
            usersFixtures.threeUsers[0].email +
            "?"
        )
      ).toBeInTheDocument();
    });
  });

  test("Clicking confirm suspend button calls suspendUser", async () => {
    render(<UsersTable users={usersFixtures.threeUsers} />);

    const suspendButtons = screen.getAllByText("Suspend");
    fireEvent.click(suspendButtons[1]);

    await waitFor(() => {
      expect(document.body).toHaveClass("modal-open");
    });

    const confirmSuspendButton = screen.getByText("Confirm Suspend");
    fireEvent.click(confirmSuspendButton);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    await waitFor(() => {
      expect(require("main/utils/users").suspendUser).toHaveBeenCalled();
    });
  });

  test("Pressing the cancel button on the suspended modal cancels the suspension", async () => {
    render(<UsersTable users={usersFixtures.threeUsers} />);

    const suspendButtons = screen.getAllByText("Suspend");
    fireEvent.click(suspendButtons[1]);

    await waitFor(() => {
      expect(document.body).toHaveClass("modal-open");
    });

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });
    expect(require("main/utils/users").suspendUser).not.toHaveBeenCalled();
  });

  test("Pressing the escape key on the suspended modal cancels the suspension", async () => {
    render(<UsersTable users={usersFixtures.threeUsers} />);

    const suspendButtons = screen.getAllByText("Suspend");
    fireEvent.click(suspendButtons[1]);

    await waitFor(() => {
      expect(document.body).toHaveClass("modal-open");
    });
    fireEvent.keyDown(document, {
      key: "Escape",
      code: "Escape",
      keyCode: 27,
      charCode: 27,
    });
    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    expect(require("main/utils/users").suspendUser).not.toHaveBeenCalled();
  });

  test("Clicking Restore button opens the modal for restoreUser", async () => {
    render(<UsersTable users={usersFixtures.threeUsers} />);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    const restoredButtons = screen.getAllByText("Restore");
    fireEvent.click(restoredButtons[1]);

    await waitFor(() => {
      expect(document.body).toHaveClass("modal-open");
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          "Are you sure you want to restore " +
            usersFixtures.threeUsers[0].email +
            "?"
        )
      ).toBeInTheDocument();
    });
  });

  test("Clicking confirm restore button calls restoreUser", async () => {
    render(<UsersTable users={usersFixtures.threeUsers} />);

    const restoredButtons = screen.getAllByText("Restore");
    fireEvent.click(restoredButtons[1]);

    await waitFor(() => {
      expect(document.body).toHaveClass("modal-open");
    });

    const confirmRestoredButton = screen.getByText("Confirm Restore");
    fireEvent.click(confirmRestoredButton);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    await waitFor(() => {
      expect(require("main/utils/users").restoreUser).toHaveBeenCalled();
    });
  });

  test("Pressing the escape key on the suspended modal cancels the suspension", async () => {
    render(<UsersTable users={usersFixtures.threeUsers} />);

    const restoredButtons = screen.getAllByText("Restore");
    fireEvent.click(restoredButtons[1]);

    await waitFor(() => {
      expect(document.body).toHaveClass("modal-open");
    });

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });
    expect(require("main/utils/users").restoreUser).not.toHaveBeenCalled();
  });

  test("Pressing the escape key on the restored modal cancels the restoration", async () => {
    render(<UsersTable users={usersFixtures.threeUsers} />);

    const restoredButtons = screen.getAllByText("Restore");
    fireEvent.click(restoredButtons[1]);

    await waitFor(() => {
      expect(document.body).toHaveClass("modal-open");
    });

    fireEvent.keyDown(document, {
      key: "Escape",
      code: "Escape",
      keyCode: 27,
      charCode: 27,
    });
    await waitFor(() => {
      expect(document.body).not.toHaveClass("modal-open");
    });

    expect(require("main/utils/users").restoreUser).not.toHaveBeenCalled();
  });
});
