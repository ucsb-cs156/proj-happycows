import React, { useState } from "react";
import { Button } from "react-bootstrap";

const MAX_ANNOUNCEMENT_LENGTH = 120;

export default function CurrentAnnouncements({ announcements }) {
  const [expanded, setExpanded] = useState({});

  if (!announcements || announcements.length === 0) {
    return null;
  }

  const toggleExpanded = (id) => {
    setExpanded((oldExpanded) => ({
      ...oldExpanded,
      [id]: !oldExpanded[id],
    }));
  };

  const getAnnouncementText = (announcement) => {
    return announcement.announcementText || announcement.message || "";
  };

  return (
    <div data-testid="CurrentAnnouncements" className="mb-3">
      {announcements.map((announcement) => {
        const isExpanded = expanded[announcement.id];
        const announcementText = getAnnouncementText(announcement);
        const shouldCollapse =
          announcementText.length > MAX_ANNOUNCEMENT_LENGTH;

        const displayedText =
          shouldCollapse && !isExpanded
            ? `${announcementText.substring(0, MAX_ANNOUNCEMENT_LENGTH)}...`
            : announcementText;

        return (
          <div
            key={announcement.id}
            className="mb-2"
            data-testid={`CurrentAnnouncements-announcement-${announcement.id}`}
          >
            <div>{displayedText}</div>

            {shouldCollapse && (
              <Button
                variant="link"
                className="p-0"
                onClick={() => toggleExpanded(announcement.id)}
                data-testid={`CurrentAnnouncements-toggle-${announcement.id}`}
              >
                {isExpanded ? "Show less" : "Show more"}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
