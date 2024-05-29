import { fireEvent, waitFor, render, screen } from "@testing-library/react";
import UsersTable from "main/components/Users/UsersTable";
import { formatTime } from "main/utils/dateUtils";
import usersFixtures from "fixtures/usersFixtures";
import { MemoryRouter } from "react-router-dom";

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate
}));

describe("UserTable tests", () => {
    test("renders without crashing for empty table", () => {
        render(
            <MemoryRouter>
                <UsersTable users={[]} />
            </MemoryRouter>
        );
    });

    test("renders without crashing for three users", () => {
        render(
            <MemoryRouter>
                <UsersTable users={usersFixtures.threeUsers} />
            </MemoryRouter>
        );
    });

    test("Suspend button calls suspend callback", async () => {
        const testId = "UsersTable";
        render(
            <MemoryRouter>
                <UsersTable users={usersFixtures.threeUsers} />
            </MemoryRouter>
        );

        expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");

        const editButton = screen.getByTestId(`${testId}-cell-row-0-col-Suspend-button`);
        expect(editButton).toBeInTheDocument();
        expect(editButton).toHaveClass("btn-danger");
        fireEvent.click(editButton);

        await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith('/admin/suspend/user/1'));
        
    });

    test("Has the expected colum headers and content", () => {
        render(
            <MemoryRouter>
                <UsersTable users={usersFixtures.threeUsers}/>
            </MemoryRouter>
        );
    
        const expectedHeaders = ["id", "First Name", "Last Name", "Email", "Last Online", "Admin"];
        const expectedFields = ["id", "givenName", "familyName", "email", "lastOnline", "admin"];
        const testId = "UsersTable";

        expectedHeaders.forEach( (headerText)=> {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

        expectedFields.forEach( (field)=> {
          const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
          expect(header).toBeInTheDocument();
        });

        expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-admin`)).toHaveTextContent("true");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-lastOnline`)).toHaveTextContent(formatTime(usersFixtures.threeUsers[0].lastOnline));
        expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("2");
        expect(screen.getByTestId(`${testId}-cell-row-1-col-admin`)).toHaveTextContent("false");
      });
});
