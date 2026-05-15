import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import RecordCommonStatsForm from "main/components/Jobs/RecordCommonStatsForm";
import { vi } from "vitest";

const queryClient = new QueryClient();

describe("RecordCommonStatsForm tests", () => {
  it("button generates correctly", async () => {
    const submitAction = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <RecordCommonStatsForm submitAction={submitAction} />
      </QueryClientProvider>,
    );
    const submitButton = screen.getByTestId("RecordCommonStats-Submit-Button");
    expect(submitButton).toBeInTheDocument();
  });
});