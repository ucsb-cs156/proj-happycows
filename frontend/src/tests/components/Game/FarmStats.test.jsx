import { render, screen, waitFor } from "@testing-library/react";
import FarmStats from "main/components/Game/FarmStats";
import farmerFixtures from "fixtures/farmerFixtures";

describe("FarmStats tests", () => {
  test("renders without crashing", () => {
    render(<FarmStats farmer={farmerFixtures.oneFarmer[0]} />);
  });

  test("contains correct content", async () => {
    render(<FarmStats farmer={farmerFixtures.oneFarmer[0]} />);

    await waitFor(() => {
      expect(screen.getByText(/Total Wealth: \$1000/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Cow Health: 98%/)).toBeInTheDocument();
    expect(screen.getByText(/Total Cows Bought: 5/)).toBeInTheDocument();
    expect(screen.getByText(/Total Cows Sold: 5/)).toBeInTheDocument();
    expect(screen.getByText(/💀 Cow Deaths: 5/)).toBeInTheDocument();
  });
});
