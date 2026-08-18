import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UsersTable from "main/components/Users/UsersTable";
import { formatTime } from "main/utils/dateUtils";
import usersFixtures from "fixtures/usersFixtures";
import { vi } from "vitest";

const mockMutate = vi.fn();

vi.mock("main/utils/users", async () => ({
  useSuspendUser: () => ({ mutate: mockMutate }),
  useRestoreUser: () => ({ mutate: mockMutate }),
}));

describe("UserTable tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

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
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-admin`),
    ).toHaveTextContent("true");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-lastOnline`),
    ).toHaveTextContent(formatTime(usersFixtures.threeUsers[0].lastOnline));
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-suspended`),
    ).toHaveTextContent("false");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Suspend-button`),
    ).toHaveClass("btn-danger");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Restore-button`),
    ).toHaveClass("btn-primary");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-admin`),
    ).toHaveTextContent("false");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-suspended`),
    ).toHaveTextContent("true");
  });

  test("sorts Last Online column by underlying timestamp, not rendered text", async () => {
    const now = new Date();
    const minutesAgo = (minutes) =>
      new Date(now.getTime() - minutes * 60 * 1000).toISOString();

    // Rendered text for these would sort as "15 minutes ago", "2 minutes ago",
    // "42 minutes ago" lexicographically, which is not chronological order.
    const users = [
      { ...usersFixtures.threeUsers[0], id: 1, lastOnline: minutesAgo(15) },
      { ...usersFixtures.threeUsers[1], id: 2, lastOnline: minutesAgo(2) },
      { ...usersFixtures.threeUsers[2], id: 3, lastOnline: minutesAgo(42) },
    ];

    render(<UsersTable users={users} />);

    const testId = "UsersTable";
    const header = screen.getByTestId(`${testId}-header-lastOnline`);

    const getVisibleIdOrder = () =>
      screen
        .getAllByRole("row")
        .slice(1) // skip header row
        .map((row) => row.querySelector("td").textContent);

    // Click once to sort ascending (oldest lastOnline first, i.e. most minutes ago).
    fireEvent.click(header);

    await waitFor(() => {
      expect(getVisibleIdOrder()).toEqual(["3", "1", "2"]);
    });

    // Click again to sort descending (most recent lastOnline first).
    fireEvent.click(header);

    await waitFor(() => {
      expect(getVisibleIdOrder()).toEqual(["2", "1", "3"]);
    });
  });

  const manyUsers = Array.from({ length: 25 }, (_, i) => ({
    ...usersFixtures.threeUsers[0],
    id: i + 1,
    email: `user${i + 1}@ucsb.edu`,
  }));

  test("renders a Page Size selector defaulting to 20", () => {
    render(<UsersTable users={manyUsers} />);

    const selector = screen.getByTestId("UsersTable-page-size-selector");
    expect(selector).toBeInTheDocument();
    expect(selector).toHaveValue("20");
  });

  test("with more users than the page size, pagination is shown and only a page's worth of rows render", () => {
    render(<UsersTable users={manyUsers} />);

    expect(
      screen.getByTestId("UsersTable-current-page-button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("UsersTable-cell-row-0-col-id"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("UsersTable-cell-row-20-col-id"),
    ).not.toBeInTheDocument();
  });

  test("selecting a page size larger than the number of users shows all rows and hides pagination", () => {
    render(<UsersTable users={manyUsers} />);

    const selector = screen.getByTestId("UsersTable-page-size-selector");
    fireEvent.change(selector, { target: { value: "50" } });

    expect(
      screen.queryByTestId("UsersTable-current-page-button"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId("UsersTable-cell-row-24-col-id"),
    ).toBeInTheDocument();
  });

  test("selecting a page size stores it in localStorage under 'users-page-size'", async () => {
    render(<UsersTable users={manyUsers} />);

    const selector = screen.getByTestId("UsersTable-page-size-selector");
    fireEvent.change(selector, { target: { value: "50" } });

    await waitFor(() => {
      expect(localStorage.getItem("users-page-size")).toBe("50");
    });
  });

  test("uses the page size stored in localStorage when it is a valid option", () => {
    localStorage.setItem("users-page-size", "50");

    render(<UsersTable users={manyUsers} />);

    const selector = screen.getByTestId("UsersTable-page-size-selector");
    expect(selector).toHaveValue("50");
  });

  test("falls back to 20 and updates localStorage when the stored value is not a valid option", () => {
    localStorage.setItem("users-page-size", "37");

    render(<UsersTable users={manyUsers} />);

    const selector = screen.getByTestId("UsersTable-page-size-selector");
    expect(selector).toHaveValue("20");
    expect(localStorage.getItem("users-page-size")).toBe("20");
  });
});

describe("Modal tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
            "?",
        ),
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
      expect(mockMutate).toHaveBeenCalled();
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
    expect(mockMutate).not.toHaveBeenCalled();
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

    expect(mockMutate).not.toHaveBeenCalled();
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
            "?",
        ),
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
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  test("Pressing the cancel button on the suspended modal cancels the restoration", async () => {
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
    expect(mockMutate).not.toHaveBeenCalled();
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

    expect(mockMutate).not.toHaveBeenCalled();
  });
});
