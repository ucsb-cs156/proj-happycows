import { render, screen } from "@testing-library/react";
import DeveloperPage from "main/pages/DeveloperPage";
import { useSystemInfo } from "main/utils/systemInfo";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";

vi.mock("main/utils/systemInfo", () => ({
  useSystemInfo: vi.fn(),
}));

vi.mock("main/utils/currentUser", async () => {
  return {
    useCurrentUser: () => ({
      data: {
        loggedIn: true,
        root: { user: { email: "test@ucsb.edu" } },
      },
    }),
    useLogout: () => ({
      mutate: vi.fn(),
    }),
    hasRole: () => true,
  };
});

describe("DeveloperPage tests", () => {
  const queryClient = new QueryClient();

  test("renders Developer Info heading", () => {
    useSystemInfo.mockReturnValue({
      data: {
        sourceRepo: "https://github.com/ucsb-cs156/proj-happycows",
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DeveloperPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Developer Info")).toBeInTheDocument();
    expect(
      screen.getByText("https://github.com/ucsb-cs156/proj-happycows")
    ).toBeInTheDocument();
  });

  test("does not crash when systemInfo is undefined", () => {
    useSystemInfo.mockReturnValue({
      data: undefined
    });
  
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DeveloperPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  
    expect(screen.getByText("Developer Info")).toBeInTheDocument();
  });
});
