import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";

import { coursesFixtures } from "fixtures/coursesFixtures";
import CoursesForm from "main/components/Courses/CoursesForm";
import { vi } from "vitest";

const { mockMutate, mockUseBackendMutation } = vi.hoisted(() => {
  const mutate = vi.fn();
  const useBackendMutationMock = vi.fn(() => ({ mutate }));
  return { mockMutate: mutate, mockUseBackendMutation: useBackendMutationMock };
});

vi.mock("main/utils/useBackend", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useBackendMutation: mockUseBackendMutation,
  };
});

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("CoursesForm tests", () => {
  const queryClient = new QueryClient();
  const testId = "CoursesForm";

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate.mockReset();
    mockUseBackendMutation.mockReset();
    mockUseBackendMutation.mockReturnValue({ mutate: mockMutate });
    mockedNavigate.mockClear();
  });

  test("renders correctly with no initialContents", async () => {
    const submitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CoursesForm submitAction={submitAction} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    ["Code", "Name", "Term"].forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-code`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-name`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-term`)).toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CoursesForm initialContents={coursesFixtures.oneCourse[0]} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue(
      `${coursesFixtures.oneCourse[0].id}`,
    );
    expect(screen.getByTestId(`${testId}-code`)).toHaveValue(
      coursesFixtures.oneCourse[0].code,
    );
    expect(screen.getByTestId(`${testId}-name`)).toHaveValue(
      coursesFixtures.oneCourse[0].name,
    );
    expect(screen.getByTestId(`${testId}-term`)).toHaveValue(
      coursesFixtures.oneCourse[0].term,
    );
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CoursesForm />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);
    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    const submitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CoursesForm submitAction={submitAction} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId(`${testId}-submit`)).toBeInTheDocument();
    const submitButton = screen.getByTestId(`${testId}-submit`);
    fireEvent.click(submitButton);

    // react-hook-form marks invalid fields; CoursesForm does not render error strings,
    // so assert inputs have 'is-invalid' class after submitting invalid form.
    await waitFor(() => {
      expect(screen.getByTestId(`${testId}-code`)).toHaveClass("is-invalid");
      expect(screen.getByTestId(`${testId}-name`)).toHaveClass("is-invalid");
      expect(screen.getByTestId(`${testId}-term`)).toHaveClass("is-invalid");
    });

    expect(submitAction).not.toBeCalled();
  });
});
