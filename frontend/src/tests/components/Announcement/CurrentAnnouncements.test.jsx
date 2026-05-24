import { fireEvent, render, screen } from "@testing-library/react";
import CurrentAnnouncements from "main/components/Announcement/CurrentAnnouncements";

describe("CurrentAnnouncements tests", () => {
  test("does not render when announcements is undefined", () => {
    render(<CurrentAnnouncements />);

    expect(
      screen.queryByTestId("CurrentAnnouncements"),
    ).not.toBeInTheDocument();
  });

  test("does not render when announcements is null", () => {
    render(<CurrentAnnouncements announcements={null} />);

    expect(
      screen.queryByTestId("CurrentAnnouncements"),
    ).not.toBeInTheDocument();
  });

  test("does not render when announcements is empty", () => {
    render(<CurrentAnnouncements announcements={[]} />);

    expect(
      screen.queryByTestId("CurrentAnnouncements"),
    ).not.toBeInTheDocument();
  });

  test("renders a short announcement without show more button", () => {
    const announcements = [
      {
        id: 1,
        announcementText: "This is a short announcement.",
      },
    ];

    render(<CurrentAnnouncements announcements={announcements} />);

    expect(screen.getByTestId("CurrentAnnouncements")).toBeInTheDocument();

    expect(
      screen.getByTestId("CurrentAnnouncements-announcement-1"),
    ).toHaveTextContent("This is a short announcement.");

    expect(
      screen.queryByTestId("CurrentAnnouncements-toggle-1"),
    ).not.toBeInTheDocument();

    expect(screen.queryByText("Show more")).not.toBeInTheDocument();
    expect(screen.queryByText("Show less")).not.toBeInTheDocument();
  });

  test("renders multiple announcements", () => {
    const announcements = [
      {
        id: 1,
        announcementText: "First announcement.",
      },
      {
        id: 2,
        announcementText: "Second announcement.",
      },
    ];

    render(<CurrentAnnouncements announcements={announcements} />);

    expect(
      screen.getByTestId("CurrentAnnouncements-announcement-1"),
    ).toHaveTextContent("First announcement.");

    expect(
      screen.getByTestId("CurrentAnnouncements-announcement-2"),
    ).toHaveTextContent("Second announcement.");
  });

  test("announcement with exactly 120 characters is not collapsed", () => {
    const exactly120Characters = "a".repeat(120);

    const announcements = [
      {
        id: 1,
        announcementText: exactly120Characters,
      },
    ];

    render(<CurrentAnnouncements announcements={announcements} />);

    expect(
      screen.getByTestId("CurrentAnnouncements-announcement-1"),
    ).toHaveTextContent(exactly120Characters);

    expect(
      screen.queryByTestId("CurrentAnnouncements-toggle-1"),
    ).not.toBeInTheDocument();
  });

  test("long announcement is collapsed by default", () => {
    const hiddenText = "This part should be hidden at first.";
    const longText =
      "This is a very long announcement that should be collapsed because it is longer than one hundred and twenty characters. " +
      hiddenText;

    const announcements = [
      {
        id: 1,
        announcementText: longText,
      },
    ];

    render(<CurrentAnnouncements announcements={announcements} />);

    const expectedPreview = `${longText.substring(0, 120)}...`;

    expect(
      screen.getByTestId("CurrentAnnouncements-announcement-1"),
    ).toHaveTextContent(expectedPreview);

    expect(
      screen.getByTestId("CurrentAnnouncements-announcement-1"),
    ).not.toHaveTextContent(hiddenText);

    expect(
      screen.getByTestId("CurrentAnnouncements-toggle-1"),
    ).toHaveTextContent("Show more");
  });

  test("long announcement can be expanded and collapsed", () => {
    const hiddenText = "This part should be hidden at first.";
    const longText =
      "This is a very long announcement that should be collapsed because it is longer than one hundred and twenty characters. " +
      hiddenText;

    const announcements = [
      {
        id: 1,
        announcementText: longText,
      },
    ];

    render(<CurrentAnnouncements announcements={announcements} />);

    const announcement = screen.getByTestId(
      "CurrentAnnouncements-announcement-1",
    );
    const toggleButton = screen.getByTestId("CurrentAnnouncements-toggle-1");

    expect(announcement).not.toHaveTextContent(hiddenText);
    expect(toggleButton).toHaveTextContent("Show more");

    fireEvent.click(toggleButton);

    expect(announcement).toHaveTextContent(longText);
    expect(announcement).toHaveTextContent(hiddenText);
    expect(toggleButton).toHaveTextContent("Show less");

    fireEvent.click(toggleButton);

    const expectedPreview = `${longText.substring(0, 120)}...`;

    expect(announcement).toHaveTextContent(expectedPreview);
    expect(announcement).not.toHaveTextContent(hiddenText);
    expect(toggleButton).toHaveTextContent("Show more");
  });

  test("expanding one announcement does not expand another announcement", () => {
    const firstHiddenText = "First hidden text.";
    const secondHiddenText = "Second hidden text.";

    const firstLongText =
      "This is the first very long announcement that should be collapsed because it is longer than one hundred and twenty characters. " +
      firstHiddenText;

    const secondLongText =
      "This is the second very long announcement that should be collapsed because it is longer than one hundred and twenty characters. " +
      secondHiddenText;

    const announcements = [
      {
        id: 1,
        announcementText: firstLongText,
      },
      {
        id: 2,
        announcementText: secondLongText,
      },
    ];

    render(<CurrentAnnouncements announcements={announcements} />);

    const firstAnnouncement = screen.getByTestId(
      "CurrentAnnouncements-announcement-1",
    );
    const secondAnnouncement = screen.getByTestId(
      "CurrentAnnouncements-announcement-2",
    );

    fireEvent.click(screen.getByTestId("CurrentAnnouncements-toggle-1"));

    expect(firstAnnouncement).toHaveTextContent(firstHiddenText);
    expect(secondAnnouncement).not.toHaveTextContent(secondHiddenText);
    expect(
      screen.getByTestId("CurrentAnnouncements-toggle-1"),
    ).toHaveTextContent("Show less");
    expect(
      screen.getByTestId("CurrentAnnouncements-toggle-2"),
    ).toHaveTextContent("Show more");
  });
  test("renders message field when announcementText is missing", () => {
    const announcements = [
      {
        id: 1,
        message: "Fallback message text",
      },
    ];

    render(<CurrentAnnouncements announcements={announcements} />);

    expect(screen.getByText("Fallback message text")).toBeInTheDocument();
  });

  test("renders empty text when announcementText and message are missing", () => {
    const announcements = [
      {
        id: 1,
      },
    ];

    render(<CurrentAnnouncements announcements={announcements} />);

    expect(
      screen.getByTestId("CurrentAnnouncements-announcement-1"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("CurrentAnnouncements-toggle-1"),
    ).not.toBeInTheDocument();
  });
});
