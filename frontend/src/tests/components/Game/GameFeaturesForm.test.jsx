import { fireEvent, render, screen } from "@testing-library/react";
import GameFeaturesForm from "main/components/Game/GameFeaturesForm";
import gameFeaturesFixtures from "fixtures/gameFeaturesFixtures";
import { vi } from "vitest";

describe("GameFeaturesForm tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with single feature", () => {
    const onSubmit = vi.fn();
    render(
      <GameFeaturesForm
        features={gameFeaturesFixtures.singleFeature}
        onSubmit={onSubmit}
      />,
    );

    expect(
      screen.getByTestId("GameFeaturesForm-FARMERS_CAN_SEE_LEADERBOARD"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Farmers Can See Leaderboard"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("GameFeaturesForm-Submit-Button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("GameFeaturesForm-Submit-Button"),
    ).toHaveTextContent("Save");
  });

  it("renders correctly with multiple features", () => {
    const onSubmit = vi.fn();
    render(
      <GameFeaturesForm
        features={gameFeaturesFixtures.threeFeatures}
        onSubmit={onSubmit}
      />,
    );

    expect(
      screen.getByTestId("GameFeaturesForm-FARMERS_CAN_SEE_LEADERBOARD"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        "GameFeaturesForm-FARMERS_CAN_SEE_HERD_SIZE_HISTOGRAM",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("GameFeaturesForm-TAXES_ON_HERD_SIZE_ARE_ENABLED"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Farmers Can See Leaderboard"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Farmers Can See Herd Size Histogram"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Taxes On Herd Size Are Enabled"),
    ).toBeInTheDocument();
  });

  it("formats feature names correctly", () => {
    const onSubmit = vi.fn();
    const features = {
      FARMERS_CAN_SEE_LEADERBOARD: false,
      SOME_OTHER_FEATURE: true,
    };

    render(<GameFeaturesForm features={features} onSubmit={onSubmit} />);

    expect(
      screen.getByLabelText("Farmers Can See Leaderboard"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Some Other Feature")).toBeInTheDocument();
  });

  it("handles checkbox changes correctly", () => {
    const onSubmit = vi.fn();
    render(
      <GameFeaturesForm
        features={gameFeaturesFixtures.singleFeature}
        onSubmit={onSubmit}
      />,
    );

    const checkbox = screen.getByTestId(
      "GameFeaturesForm-FARMERS_CAN_SEE_LEADERBOARD",
    );

    // Initially false
    expect(checkbox).not.toBeChecked();

    // Click to toggle
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Click again to toggle back
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("calls onSubmit with updated features when form is submitted", () => {
    const onSubmit = vi.fn();
    render(
      <GameFeaturesForm
        features={gameFeaturesFixtures.singleFeature}
        onSubmit={onSubmit}
      />,
    );

    const checkbox = screen.getByTestId(
      "GameFeaturesForm-FARMERS_CAN_SEE_LEADERBOARD",
    );
    const submitButton = screen.getByTestId("GameFeaturesForm-Submit-Button");

    // Toggle the checkbox
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Submit the form
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      FARMERS_CAN_SEE_LEADERBOARD: true,
    });
  });

  it("does not call onSubmit if onSubmit is not provided", () => {
    render(<GameFeaturesForm features={gameFeaturesFixtures.singleFeature} />);

    const submitButton = screen.getByTestId("GameFeaturesForm-Submit-Button");

    // Submit the form - should not throw
    fireEvent.click(submitButton);
  });

  it("uses custom button label when provided", () => {
    const onSubmit = vi.fn();
    render(
      <GameFeaturesForm
        features={gameFeaturesFixtures.singleFeature}
        onSubmit={onSubmit}
        buttonLabel="Update Features"
      />,
    );

    expect(
      screen.getByTestId("GameFeaturesForm-Submit-Button"),
    ).toHaveTextContent("Update Features");
  });

  it("updates local state when features prop changes", () => {
    const onSubmit = vi.fn();
    const { rerender } = render(
      <GameFeaturesForm
        features={gameFeaturesFixtures.singleFeature}
        onSubmit={onSubmit}
      />,
    );

    const checkbox = screen.getByTestId(
      "GameFeaturesForm-FARMERS_CAN_SEE_LEADERBOARD",
    );
    expect(checkbox).not.toBeChecked();

    // Update features prop
    rerender(
      <GameFeaturesForm
        features={{ FARMERS_CAN_SEE_LEADERBOARD: true }}
        onSubmit={onSubmit}
      />,
    );

    expect(checkbox).toBeChecked();
  });

  it("handles empty features object", () => {
    const onSubmit = vi.fn();
    render(<GameFeaturesForm features={{}} onSubmit={onSubmit} />);

    // Should render without crashing
    expect(
      screen.getByTestId("GameFeaturesForm-Submit-Button"),
    ).toBeInTheDocument();
  });
});
