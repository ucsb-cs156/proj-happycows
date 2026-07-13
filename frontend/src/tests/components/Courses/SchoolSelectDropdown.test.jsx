import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import SchoolSelectDropdown from "main/components/Courses/SchoolSelectDropdown";
import { schoolsFixtures } from "fixtures/schoolsFixtures";
import { vi } from "vitest";

describe("SchoolSelectDropdown tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock
      .onGet("/api/course/schools")
      .reply(200, schoolsFixtures.activeSchools);
  });

  test("renders active schools and requires a value by default", async () => {
    const register = vi.fn();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <SchoolSelectDropdown register={register} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("SchoolSelectDropdown-school"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId("SchoolSelectDropdown-school-UCSB"),
    ).toHaveTextContent("UCSB");
    expect(
      screen.getByTestId("SchoolSelectDropdown-school-OTHER"),
    ).toHaveTextContent("Other");

    expect(register).toHaveBeenCalledWith(
      "school",
      expect.objectContaining({ required: "School is required." }),
    );
  });

  test("supports overriding the testIdPrefix prop", async () => {
    const register = vi.fn();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <SchoolSelectDropdown register={register} testIdPrefix="CoursesForm" />
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("CoursesForm-school-UCSB"),
    ).toBeInTheDocument();
  });
});
