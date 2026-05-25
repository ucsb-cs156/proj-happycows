import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import AdminCoursesEditPage from "main/pages/AdminCoursesEditPage";

const mockUseBackend = vi.fn();
const mockUseBackendMutation = vi.fn();
const mockCourseForm = vi.fn(() => <div data-testid="mock-course-form" />);

vi.mock("main/utils/useBackend", () => ({
  useBackend: (...args) => mockUseBackend(...args),
  useBackendMutation: (...args) => mockUseBackendMutation(...args),
}));

vi.mock("main/components/Courses/CourseForm", () => ({
  default: (props) => mockCourseForm(props),
}));

vi.mock("main/layouts/BasicLayout/BasicLayout", () => ({
  default: ({ children }) => <div data-testid="basic-layout">{children}</div>,
}));

vi.mock("react-toastify", () => ({
  toast: vi.fn(),
}));

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    __esModule: true,
    ...originalModule,
    useParams: () => ({ id: 7 }),
    Navigate: () => null,
  };
});

describe("AdminCoursesEditPage config tests", () => {
  beforeEach(() => {
    mockUseBackend.mockReset();
    mockUseBackendMutation.mockReset();
    mockCourseForm.mockClear();

    mockUseBackend.mockReturnValue({
      data: {
        id: 7,
        code: "CHEM 123",
        name: "Environmental Chemistry",
        term: "W26",
      },
    });

    mockUseBackendMutation.mockReturnValue({
      mutate: vi.fn(),
      isSuccess: false,
    });
  });

  test("configures backend hooks with expected query keys and request builder", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCoursesEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(mockUseBackend).toHaveBeenCalledWith(["/api/course/7"], {
      method: "GET",
      url: "/api/course/7",
    });

    expect(mockUseBackendMutation).toHaveBeenCalledTimes(1);

    const [requestBuilder, options, cacheKeys] =
      mockUseBackendMutation.mock.calls[0];

    expect(cacheKeys).toEqual(["/api/course/7"]);
    expect(options).toEqual({ onSuccess: expect.any(Function) });
    expect(
      requestBuilder({
        id: 7,
        code: "CHEM 123",
        name: "Advanced Environmental Chemistry",
        term: "S26",
      }),
    ).toEqual({
      url: "/api/course/7",
      method: "PUT",
      data: {
        code: "CHEM 123",
        name: "Advanced Environmental Chemistry",
        term: "S26",
      },
    });
  });
});
