import { cellToAxiosParamsSuspend, onSuspendSuccess, cellToAxiosParamsRestore, onRestoreSuccess } from "main/utils/usersUtils"
import mockConsole from "jest-mock-console";

const mockToast = jest.fn();
jest.mock('react-toastify', () => {
    const originalModule = jest.requireActual('react-toastify');
    return {
        __esModule: true,
        ...originalModule,
        toast: (x) => mockToast(x)
    };
});

describe("UsersUtils", () => {

    describe("onSuspendSuccess", () => {

        test("It puts the message on console.log and in a toast", () => {
            // arrange
            const restoreConsole = mockConsole();

            // act
            onSuspendSuccess("abc");

            // assert
            expect(mockToast).toHaveBeenCalledWith("abc");
            expect(console.log).toHaveBeenCalled();
            const message = console.log.mock.calls[0][0];
            expect(message).toMatch("abc");

            restoreConsole();
        });

    });
    describe("cellToAxiosParamsSuspend", () => {

        test("It returns the correct params", () => {
            // arrange
            const cell = { row: { values: { id: 1 } } };

            // act
            const result = cellToAxiosParamsSuspend(cell);

            // assert
            expect(result).toEqual({
                url: "/api/admin/users/suspend",
                method: "POST",
                params: { id: 1 }
            });
        });

    });

    describe("onRestoreSuccess", () => {

        test("It puts the message on console.log and in a toast", () => {
            // arrange
            const restoreConsole = mockConsole();

            // act
            onRestoreSuccess("abc");

            // assert
            expect(mockToast).toHaveBeenCalledWith("abc");
            expect(console.log).toHaveBeenCalled();
            const message = console.log.mock.calls[0][0];
            expect(message).toMatch("abc");

            restoreConsole();
        });

    });
    describe("cellToAxiosParamsRestore", () => {

        test("It returns the correct params", () => {
            // arrange
            const cell = { row: { values: { id: 1 } } };

            // act
            const result = cellToAxiosParamsRestore(cell);

            // assert
            expect(result).toEqual({
                url: "/api/admin/users/restore",
                method: "POST",
                params: { id: 1 }
            });
        });
    });
});





