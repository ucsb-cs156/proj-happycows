import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import CourseSelectDropdown from "main/components/Courses/CourseSelectDropdown";
import { coursesFixtures } from "fixtures/coursesFixtures";
import { vi } from "vitest";

describe("CourseSelectDropdown tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.onGet("/api/course/all").reply(200, coursesFixtures.threeCourses);
  });

  test("renders course options, without a No Course option by default", async () => {
    const register = vi.fn();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <CourseSelectDropdown register={register} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("CourseSelectDropdown-courseId"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId("CourseSelectDropdown-courseId-1"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("CourseSelectDropdown-courseId-2"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("CourseSelectDropdown-courseId-3"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("CourseSelectDropdown-courseId-none"),
    ).not.toBeInTheDocument();

    expect(register).toHaveBeenCalledWith(
      "courseId",
      expect.objectContaining({ required: "Course is required." }),
    );
  });

  test("renders a No Course option when includeNoCourseOption is true", async () => {
    const register = vi.fn();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <CourseSelectDropdown register={register} includeNoCourseOption />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("CourseSelectDropdown-courseId-none"),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("No Course")).toBeInTheDocument();

    expect(register).toHaveBeenCalledWith(
      "courseId",
      expect.objectContaining({ required: false }),
    );
  });

  test("setValueAs converts an empty string to null and a numeric string to a Number", async () => {
    const register = vi.fn();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <CourseSelectDropdown register={register} includeNoCourseOption />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(register).toHaveBeenCalled();
    });

    const { setValueAs } = register.mock.calls[0][1];
    expect(setValueAs("")).toBeNull();
    expect(setValueAs("2")).toBe(2);
  });

  test("supports overriding the formName, displayName, and testIdPrefix", async () => {
    const register = vi.fn();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <CourseSelectDropdown
          register={register}
          formName="staffCourseId"
          displayName="Staff Course"
          testIdPrefix="StaffForm"
          includeNoCourseOption
        />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Staff Course")).toBeInTheDocument();
    expect(
      screen.getByTestId("StaffForm-staffCourseId-none"),
    ).toBeInTheDocument();
  });
});
