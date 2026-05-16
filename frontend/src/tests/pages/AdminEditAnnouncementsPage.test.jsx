import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import AdminEditAnnouncementsPage from "main/pages/AdminEditAnnouncementsPage";

vi.mock("main/layouts/BasicLayout/BasicLayout", () => ({
  default: ({ children }) => <div data-testid="BasicLayout">{children}</div>,
}));

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useParams: () => ({
    commonsId: 1,
    announcementId: 2,
  }),
}));

describe("AdminEditAnnouncementsPage tests", () => {
  test("renders page with the announcement ids", () => {
    render(
      <MemoryRouter>
        <AdminEditAnnouncementsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Edit Announcement")).toBeInTheDocument();
    expect(
      screen.getByText("Not implemented yet; coming soon!"),
    ).toBeInTheDocument();
    expect(screen.getByText("Commons ID: 1")).toBeInTheDocument();
    expect(screen.getByText("Announcement ID: 2")).toBeInTheDocument();
  });
});
