import { render, screen } from "@testing-library/react";
import { announcementFixtures } from "fixtures/announcementFixtures";
import AnnouncementCard, { isFutureDate } from "main/components/Announcement/AnnouncementCard";

const curr = new Date();

describe("AnnouncementCard tests", () => {
    test("renders without crashing", async () => {
        render(
            <AnnouncementCard announcement={announcementFixtures.threeAnnouncements[1]} />
        );

        const textElement = screen.getByText("This is a test announcement for commons id 1. This one doesn't have an end date.");
        expect(textElement).toBeInTheDocument();
    });

    test("cannot show announcement with future start date - future year", async () => {
        const futureYearAnnouncement = {
            ...announcementFixtures.threeAnnouncements[0],
            startDate: new Date(curr.getFullYear() + 1, curr.getMonth(), curr.getDate()).toISOString().substring(0, 10)
        };

        render(
            <AnnouncementCard announcement={futureYearAnnouncement} />
        );

        const textElement = screen.queryByText(futureYearAnnouncement.announcementText);
        expect(textElement).toBeNull();
    });

    test("cannot show announcement with future start date - future month", async () => {
        const futureMonthAnnouncement = {
            ...announcementFixtures.threeAnnouncements[0],
            startDate: new Date(curr.getFullYear(), curr.getMonth() + 1, curr.getDate()).toISOString().substring(0, 10)
        };

        render(
            <AnnouncementCard announcement={futureMonthAnnouncement} />
        );

        const textElement = screen.queryByText(futureMonthAnnouncement.announcementText);
        expect(textElement).toBeNull();
    });

    test("can show announcement with past date - past month", async () => {
        const pastMonthAnnouncement = {
            ...announcementFixtures.threeAnnouncements[1],
            startDate: new Date(curr.getFullYear(), curr.getMonth() - 1, curr.getDate()).toISOString().substring(0, 10)
        };

        render(
            <AnnouncementCard announcement={pastMonthAnnouncement} />
        );

        const textElement = screen.getByText("This is a test announcement for commons id 1. This one doesn't have an end date.");
        expect(textElement).toBeInTheDocument();
    });

    test("cannot show announcement with future start date - future day", async () => {
        const futureDayAnnouncement = {
            ...announcementFixtures.threeAnnouncements[0],
            startDate: new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + 10).toISOString().substring(0, 10)
        };

        render(
            <AnnouncementCard announcement={futureDayAnnouncement} />
        );

        const textElement = screen.queryByText(futureDayAnnouncement.announcementText);
        expect(textElement).toBeNull();
    });

    test("can show announcement with current date", async () => {
        const currentDayAnnouncement = {
            ...announcementFixtures.threeAnnouncements[1],
            startDate: new Date(curr.getFullYear(), curr.getMonth(), curr.getDate()).toISOString().substring(0, 10)
        };

        render(
            <AnnouncementCard announcement={currentDayAnnouncement} />
        );

        const textElement = screen.getByText("This is a test announcement for commons id 1. This one doesn't have an end date.");
        expect(textElement).toBeInTheDocument();
    });

    test("cannot show announcement with past end date - past day", async () => {
        const pastDayAnnouncement = {
            ...announcementFixtures.threeAnnouncements[0],
            startDate: new Date(curr.getFullYear() - 1, curr.getMonth(), curr.getDate()).toISOString().substring(0, 10),
            endDate: new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() - 1).toISOString().substring(0, 10)
        };

        render(
            <AnnouncementCard announcement={pastDayAnnouncement} />
        );

        const textElement = screen.queryByText(pastDayAnnouncement.announcementText);
        expect(textElement).toBeNull();
    });

    test("renders with correct data-testid", async () => {
        render(
            <AnnouncementCard announcement={announcementFixtures.threeAnnouncements[1]} />
        );

        const testId = `announcementCard-id-${announcementFixtures.threeAnnouncements[1].announcementText}`;
        const element = screen.getByTestId(testId);
        expect(element).toBeInTheDocument();
    });

    test("isFutureDate function works correctly", () => {
        const futureDate = `${curr.getFullYear() + 1}-01-01T00:00:00`;
        const pastDate = `${curr.getFullYear() - 1}-01-01T00:00:00`;
        const futureDay = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + 1).toISOString().substring(0, 10);

        expect(isFutureDate(futureDate)).toBe(true);
        expect(isFutureDate(pastDate)).toBe(false);
        expect(isFutureDate(futureDay)).toBe(true);
    });

    test("renders long announcement text correctly", async () => {
        const longTextAnnouncement = {
            ...announcementFixtures.threeAnnouncements[1],
            announcementText: "This is a very long announcement text that should be collapsed initially but expanded when the button is clicked.".repeat(10)
        };

        render(
            <AnnouncementCard announcement={longTextAnnouncement} />
        );

        const collapsedText = screen.getByText(/This is a very long announcement text/);
        expect(collapsedText).toBeInTheDocument();
    });

    test("handles announcement without end date", async () => {
        const noEndDateAnnouncement = {
            ...announcementFixtures.threeAnnouncements[1],
            endDate: null
        };

        render(
            <AnnouncementCard announcement={noEndDateAnnouncement} />
        );

        const textElement = screen.getByText("This is a test announcement for commons id 1. This one doesn't have an end date.");
        expect(textElement).toBeInTheDocument();
    });

    test("handles announcement without start date", async () => {
        const noStartDateAnnouncement = {
            ...announcementFixtures.threeAnnouncements[1],
            startDate: null
        };

        render(
            <AnnouncementCard announcement={noStartDateAnnouncement} />
        );

        const textElement = screen.queryByText(noStartDateAnnouncement.announcementText);
        expect(textElement).toBeNull();
    });
});

