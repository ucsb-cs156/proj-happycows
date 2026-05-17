import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { announcementFixtures } from "fixtures/announcementFixtures";
import AnnouncementTable from "main/components/Announcement/AnnouncementTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/announcementUtils";
import { vi } from "vitest";

const { mockMutate, mockUseBackendMutation } = vi.hoisted(() => {
  const mutate = vi.fn();
  const useBackendMutationMock = vi.fn(() => ({ mutate }));
  return { mockMutate: mutate, mockUseBackendMutation: useBackendMutationMock };
});

vi.mock("main/utils/useBackend", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useBackendMutation: mockUseBackendMutation,
  };
});

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("AnnouncementTable tests", () => {
  const queryClient = new QueryClient();
  beforeEach(() => {
    mockMutate.mockReset();
    mockUseBackendMutation.mockReset();
    mockUseBackendMutation.mockReturnValue({ mutate: mockMutate });
    mockedNavigate.mockClear();
  });

  const expectedHeaders = [
    "id",
    "Start Date ISO Format",
    "End Date ISO Format",
    "Announcement",
  ];
  const expectedFields = ["id", "startDate", "endDate", "announcementText"];
  const testId = "AnnouncementTable";
  const [firstAnnouncement, secondAnnouncement] =
    announcementFixtures.threeAnnouncements;

  const renderTable = (announcements, currentUser, commonsId = 1) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AnnouncementTable
            announcements={announcements}
            currentUser={currentUser}
            commonsId={commonsId}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders empty table correctly", () => {
    renderTable([], currentUserFixtures.adminUser);

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const fieldElement = screen.queryByTestId(
        `${testId}-cell-row-0-col-${field}`,
      );
      expect(fieldElement).not.toBeInTheDocument();
    });
  });

  test("Has the expected column headers, content and buttons for admin user", () => {
    renderTable(
      announcementFixtures.threeAnnouncements,
      currentUserFixtures.adminUser,
    );

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      `${firstAnnouncement.id}`,
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-startDate`),
    ).toHaveTextContent(firstAnnouncement.startDate);

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      `${secondAnnouncement.id}`,
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-startDate`),
    ).toHaveTextContent(secondAnnouncement.startDate);

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Has the expected column headers, content for ordinary user", () => {
    renderTable(
      announcementFixtures.threeAnnouncements,
      currentUserFixtures.userOnly,
    );

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      `${firstAnnouncement.id}`,
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-startDate`),
    ).toHaveTextContent(firstAnnouncement.startDate);

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      `${secondAnnouncement.id}`,
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-startDate`),
    ).toHaveTextContent(secondAnnouncement.startDate);

    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  test("Edit button navigates to the edit page", async () => {
    renderTable(
      announcementFixtures.threeAnnouncements,
      currentUserFixtures.adminUser,
    );

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith(
        `/admin/announcements/1/edit/${firstAnnouncement.id}`,
      ),
    );
  });

  test("Delete button calls delete mutation", async () => {
    renderTable(
      announcementFixtures.threeAnnouncements,
      currentUserFixtures.adminUser,
    );

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    fireEvent.click(deleteButton);

    await waitFor(() => expect(mockMutate).toHaveBeenCalledTimes(1));
  });

  test("Configures delete mutation with expected args", () => {
    renderTable(
      announcementFixtures.threeAnnouncements,
      currentUserFixtures.adminUser,
      5,
    );

    expect(mockUseBackendMutation).toHaveBeenCalledWith(
      cellToAxiosParamsDelete,
      expect.objectContaining({ onSuccess: onDeleteSuccess }),
      ["/api/announcements/getbycommonsid?commonsId=5"],
    );
  });
});
