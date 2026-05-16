import React, { useState } from "react";
import { Alert, Button } from "react-bootstrap";

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

  return (
    <div data-testid="CurrentAnnouncements">
      {announcements.map((announcement) => {
        const isExpanded = expanded[announcement.id];
        const announcementText = announcement.announcementText;
        const shouldCollapse = announcementText.length > 120;

        const displayedText =
          shouldCollapse && !isExpanded
            ? `${announcementText.substring(0, 120)}...`
            : announcementText;

        return (
          <Alert
            key={announcement.id}
            variant="info"
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
          </Alert>
        );
      })}
    </div>
  );
}