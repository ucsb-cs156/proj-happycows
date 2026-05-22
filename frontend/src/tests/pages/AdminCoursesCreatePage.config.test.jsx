import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import AdminCoursesCreatePage from "main/pages/AdminCoursesCreatePage";

const mockUseBackendMutation = vi.fn();
const mockCourseForm = vi.fn(() => <div data-testid="mock-course-form" />);

vi.mock("main/utils/useBackend", () => ({
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
    Navigate: () => null,
  };
});

describe("AdminCoursesCreatePage config tests", () => {
  beforeEach(() => {
    mockUseBackendMutation.mockReset();
    mockCourseForm.mockClear();
    mockUseBackendMutation.mockReturnValue({
      mutate: vi.fn(),
      isSuccess: false,
    });
  });

  test("configures mutation hook with expected cache key and request builder", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCoursesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(mockUseBackendMutation).toHaveBeenCalledTimes(1);

    const [requestBuilder, options, cacheKeys] =
      mockUseBackendMutation.mock.calls[0];

    expect(cacheKeys).toEqual(["/api/course/all"]);
    expect(options).toEqual({ onSuccess: expect.any(Function) });
    expect(
      requestBuilder({
        code: "CMPSC 156",
        name: "Advanced Applications Programming",
        term: "F25",
      }),
    ).toEqual({
      url: "/api/course",
      method: "POST",
      data: {
        code: "CMPSC 156",
        name: "Advanced Applications Programming",
        term: "F25",
      },
    });
  });
});
