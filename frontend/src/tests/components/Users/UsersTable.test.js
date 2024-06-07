import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import usersFixtures from "fixtures/usersFixtures";
import UsersTable from "main/components/Users/UsersTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { cellToAxiosParamsSuspend, onSuspendSuccess, cellToAxiosParamsRestore, onRestoreSuccess } from "main/utils/usersUtils"
import * as useBackendModule from "main/utils/useBackend";
import { formatTime } from "main/utils/dateUtils";



const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}));

describe("UsersTable tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["id", "First Name", "Last Name", "Email", "Last Online", "Admin", "Suspended"];
  const expectedFields = ["id", "givenName", "familyName", "email", "lastOnline", "admin", "suspended"];

  test("renders empty table correctly", () => {

    const testId = "UsersTable";
    
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable users={[]} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const fieldElement = screen.queryByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(fieldElement).not.toBeInTheDocument();
    });
  });

  test("Has the expected column headers, content and buttons for admin user", () => {

    const testId = "UsersTable";

    // arrange
    const currentUser = currentUserFixtures.adminUser;

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable users={usersFixtures.threeUsers} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");
    expect(screen.getByTestId(`${testId}-cell-row-0-col-admin`)).toHaveTextContent("true");
    expect(screen.getByTestId(`${testId}-cell-row-0-col-lastOnline`)).toHaveTextContent(formatTime(usersFixtures.threeUsers[0].lastOnline));
    expect(screen.getByTestId(`${testId}-cell-row-0-col-suspended`)).toHaveTextContent("false");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("2");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-admin`)).toHaveTextContent("false");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-suspended`)).toHaveTextContent("true");

    const suspendButton = screen.getByTestId(`${testId}-cell-row-0-col-Suspend-button`);
    expect(suspendButton).toBeInTheDocument();
    expect(suspendButton).toHaveClass("btn-danger");

    const restoreButton = screen.getByTestId(`${testId}-cell-row-0-col-Restore-button`);
    expect(restoreButton).toBeInTheDocument();
    expect(restoreButton).toHaveClass("btn-success");

  });

  test("Has the expected column headers, content for ordinary user", () => {
    // arrange
    const currentUser = currentUserFixtures.userOnly;

    const testId = "UsersTable";

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable users={usersFixtures.threeUsers} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");
    expect(screen.getByTestId(`${testId}-cell-row-0-col-admin`)).toHaveTextContent("true");
    expect(screen.getByTestId(`${testId}-cell-row-0-col-lastOnline`)).toHaveTextContent(formatTime(usersFixtures.threeUsers[0].lastOnline));
    expect(screen.getByTestId(`${testId}-cell-row-0-col-suspended`)).toHaveTextContent("false");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("2");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-admin`)).toHaveTextContent("false");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-suspended`)).toHaveTextContent("true");

    expect(screen.queryByText("Suspend")).not.toBeInTheDocument();
    expect(screen.queryByText("Restore")).not.toBeInTheDocument();
  });
});


describe("Modal tests", () => {

  const queryClient = new QueryClient();

  // Mocking the delete mutation function
  const mockMutate = jest.fn();
  const mockUseBackendMutation = {
    mutate: mockMutate,
  };

  beforeEach(() => {
    jest.spyOn(useBackendModule, "useBackendMutation").mockReturnValue(mockUseBackendMutation);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });



  test("Clicking Suspend button opens the modal for adminUser", async () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable users={usersFixtures.threeUsers} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Verify that the modal is hidden by checking for the absence of the "modal-open" class
    await waitFor(() => {
      expect(document.body).not.toHaveClass('modal-open');
    });

    const suspendButton = screen.getByTestId("UsersTable-cell-row-0-col-Suspend-button");
    fireEvent.click(suspendButton);

    // Verify that the modal is shown by checking for the "modal-open" class
    await waitFor(() => {
      expect(document.body).toHaveClass('modal-open');
    });
    expect(screen.getByText("Are you sure you want to suspend this user?")).toBeInTheDocument();

  });

  test("Clicking Restore button opens the modal for adminUser", async () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable users={usersFixtures.threeUsers} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Verify that the modal is hidden by checking for the absence of the "modal-open" class
    await waitFor(() => {
      expect(document.body).not.toHaveClass('modal-open');
    });

    const restoreButton = screen.getByTestId("UsersTable-cell-row-0-col-Restore-button");
    fireEvent.click(restoreButton);

    // Verify that the modal is shown by checking for the "modal-open" class
    await waitFor(() => {
      expect(document.body).toHaveClass('modal-open');
    });
    expect(screen.getByText("Are you sure you want to restore this user?")).toBeInTheDocument();

  });



  test("Clicking Suspend this User button suspends the user", async () => {
    const currentUser = currentUserFixtures.adminUser;

    // https://www.chakshunyu.com/blog/how-to-spy-on-a-named-import-in-jest/
    const useBackendMutationSpy = jest.spyOn(useBackendModule, 'useBackendMutation');

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable users={usersFixtures.threeUsers} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const suspendButton = screen.getByTestId("UsersTable-cell-row-0-col-Suspend-button");
    fireEvent.click(suspendButton);

    const suspendUserButton = await screen.findByTestId("UsersTable-Modal-Suspend");
    fireEvent.click(suspendUserButton);

    await waitFor(() => {
      expect(useBackendMutationSpy).toHaveBeenCalledWith(
        cellToAxiosParamsSuspend,
        { onSuccess: onSuspendSuccess },
        ["/api/admin/users"]
      );
    });

    // Verify that the modal is hidden by checking for the absence of the "modal-open" class
    await waitFor(() => {
      expect(document.body).not.toHaveClass('modal-open');
    });
    expect(screen.queryByText("Are you sure you want to suspend this user?")).not.toBeInTheDocument();

  });

  test("Clicking Restore this User button restores the user", async () => {
    const currentUser = currentUserFixtures.adminUser;

    // https://www.chakshunyu.com/blog/how-to-spy-on-a-named-import-in-jest/
    const useBackendMutationSpy = jest.spyOn(useBackendModule, 'useBackendMutation');

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable users={usersFixtures.threeUsers} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const restoreButton = screen.getByTestId("UsersTable-cell-row-0-col-Restore-button");
    fireEvent.click(restoreButton);

    const restoreUserButton = await screen.findByTestId("UsersTable-Modal-Restore");
    fireEvent.click(restoreUserButton);

    await waitFor(() => {
      expect(useBackendMutationSpy).toHaveBeenCalledWith(
        cellToAxiosParamsRestore,
        { onSuccess: onRestoreSuccess },
        ["/api/admin/users"]
      );
    });

    // Verify that the modal is hidden by checking for the absence of the "modal-open" class
    await waitFor(() => {
      expect(document.body).not.toHaveClass('modal-open');
    });
    expect(screen.queryByText("Are you sure you want to restore this user?")).not.toBeInTheDocument();

  });



  test("Clicking Leave this User as is button cancels the suspension", async () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable users={usersFixtures.threeUsers} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const suspendButton = screen.getByTestId("UsersTable-cell-row-0-col-Suspend-button");
    fireEvent.click(suspendButton);

    const cancelSuspendButton = await screen.findByTestId("UsersTable-SuspendModal-Cancel");
    fireEvent.click(cancelSuspendButton);

    // Verify that the modal is hidden by checking for the absence of the "modal-open" class
    await waitFor(() => {
      expect(document.body).not.toHaveClass('modal-open');
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  test("Clicking Leave this User as is button cancels the restoration", async () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable users={usersFixtures.threeUsers} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const restoreButton = screen.getByTestId("UsersTable-cell-row-0-col-Restore-button");
    fireEvent.click(restoreButton);

    const cancelSuspendButton = await screen.findByTestId("UsersTable-RestoreModal-Cancel");
    fireEvent.click(cancelSuspendButton);

    // Verify that the modal is hidden by checking for the absence of the "modal-open" class
    await waitFor(() => {
      expect(document.body).not.toHaveClass('modal-open');
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });



  test("Pressing the escape key on the modal cancels the suspension", async () => {
    const currentUser = currentUserFixtures.adminUser;
  
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable users={usersFixtures.threeUsers} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>
    );
  
    // Click the delete button to open the modal
    const suspendButton = screen.getByTestId("UsersTable-cell-row-0-col-Suspend-button");
    fireEvent.click(suspendButton);
  
    // Check that the modal is displayed by checking for the "modal-open" class in the body
    expect(document.body).toHaveClass('modal-open');
  
    // Click the close button
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
  
    // Verify that the modal is hidden by checking for the absence of the "modal-open" class
    await waitFor(() => {
      expect(document.body).not.toHaveClass('modal-open');
    });
  
    // Assert that the delete mutation was not called
    // (you'll need to replace `mockMutate` with the actual reference to the mutation in your code)
    expect(mockMutate).not.toHaveBeenCalled();
  });

  test("Pressing the escape key on the modal cancels the restoration", async () => {
    const currentUser = currentUserFixtures.adminUser;
  
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable users={usersFixtures.threeUsers} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>
    );
  
    // Click the delete button to open the modal
    const restoreButton = screen.getByTestId("UsersTable-cell-row-0-col-Restore-button");
    fireEvent.click(restoreButton);
  
    // Check that the modal is displayed by checking for the "modal-open" class in the body
    expect(document.body).toHaveClass('modal-open');
  
    // Click the close button
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
  
    // Verify that the modal is hidden by checking for the absence of the "modal-open" class
    await waitFor(() => {
      expect(document.body).not.toHaveClass('modal-open');
    });
  
    // Assert that the delete mutation was not called
    // (you'll need to replace `mockMutate` with the actual reference to the mutation in your code)
    expect(mockMutate).not.toHaveBeenCalled();
  });


});
