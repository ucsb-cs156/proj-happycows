import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import CourseForm from "main/components/Courses/CourseForm";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    __esModule: true,
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("CourseForm tests", () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
  });

  test("renders create form and submits entered values", async () => {
    const submitAction = vi.fn();

    render(
      <MemoryRouter>
        <CourseForm submitAction={submitAction} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("CourseForm-code")).toBeInTheDocument();
    expect(screen.getByTestId("CourseForm-name")).toBeInTheDocument();
    expect(screen.getByTestId("CourseForm-term")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Course Code"), {
      target: { value: "CMPSC 156" },
    });
    fireEvent.change(screen.getByLabelText("Course Name"), {
      target: { value: "Advanced Applications Programming" },
    });
    fireEvent.change(screen.getByLabelText("Term"), {
      target: { value: "F25" },
    });

    fireEvent.click(screen.getByTestId("CourseForm-submit"));

    await waitFor(() => expect(submitAction).toHaveBeenCalled());

    expect(submitAction.mock.calls[0][0]).toEqual({
      code: "CMPSC 156",
      name: "Advanced Applications Programming",
      term: "F25",
    });
  });

  test("renders edit form with initial values", () => {
    render(
      <MemoryRouter>
        <CourseForm
          initialCourse={{
            id: 7,
            code: "CHEM 123",
            name: "Environmental Chemistry",
            term: "W26",
          }}
          submitAction={vi.fn()}
          buttonLabel="Update"
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("CourseForm-id")).toHaveValue("7");
    expect(screen.getByLabelText("Course Code")).toHaveValue("CHEM 123");
    expect(screen.getByLabelText("Course Name")).toHaveValue(
      "Environmental Chemistry",
    );
    expect(screen.getByLabelText("Term")).toHaveValue("W26");
    expect(screen.getByText("Update")).toBeInTheDocument();
  });

  test("shows validation messages when required fields are missing", async () => {
    render(
      <MemoryRouter>
        <CourseForm submitAction={vi.fn()} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("CourseForm-submit"));

    expect(await screen.findByText("Course code is required.")).toBeVisible();
    expect(screen.getByText("Course name is required.")).toBeVisible();
    expect(screen.getByText("Term is required.")).toBeVisible();
  });

  test("cancel button navigates back", () => {
    render(
      <MemoryRouter>
        <CourseForm submitAction={vi.fn()} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("CourseForm-cancel"));

    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });
});
