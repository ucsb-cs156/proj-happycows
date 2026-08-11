import UserProfileTable from "main/components/UserProfileTable";
import { render, screen } from "@testing-library/react";

describe("UserProfileTable tests", () => {
  test("renders an empty table without crashing", () => {
    render(<UserProfileTable user={{}} />);

    expect(screen.queryByText("Stryker was here!")).not.toBeInTheDocument();
  });
  test("renders a table with user info", () => {
    const user = {
      givenName: "Joe",
      familyName: "Biden",
      email: "joebiden@whitehouse.gov",
      game: [{ name: "Game 1" }, { name: "Game 2" }],
      id: 1,
      admin: true,
      hostedDomain: "whitehouse.gov",
      locale: "en",
    };

    render(<UserProfileTable user={user} />);

    expect(screen.getByText("Joe")).toBeInTheDocument();
    expect(screen.getByText("Biden")).toBeInTheDocument();
    expect(screen.getByText("joebiden@whitehouse.gov")).toBeInTheDocument();
    expect(screen.getByText("Game 1, Game 2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("true")).toBeInTheDocument();
    expect(screen.getByText("whitehouse.gov")).toBeInTheDocument();
    expect(screen.getByText("en")).toBeInTheDocument();
    expect(screen.queryByText("Stryker was here!")).not.toBeInTheDocument();
  });
});
