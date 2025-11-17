import React from "react";
import ChatMessageDisplay from "main/components/Chat/ChatMessageDisplay";
import { useBackend } from "main/utils/useBackend";
import { Link } from "react-router";

// Props for storybook manual injection

const ChatDisplay = ({ commonsId }) => {
  const initialMessagePageSize = 10;
  const refreshRate = 2000;

  // Stryker disable all

  const { data: messagesPage } = useBackend(
    [
      `/api/chat/get?page=0&size=${initialMessagePageSize}&commonsId=${commonsId}`,
    ],
    {
      method: "GET",
      url: `/api/chat/get`,
      params: {
        commonsId: commonsId,
        page: 0,
        size: initialMessagePageSize,
      },
    },
    { content: [], totalElements: 0 },
    { refetchInterval: refreshRate },
  );

  const { data: userCommonsList } = useBackend(
    [`/api/usercommons/commons/all`],
    {
      method: "GET",
      url: "/api/usercommons/commons/all",
      params: {
        commonsId: commonsId,
      },
    },
    [],
    { refetchInterval: refreshRate },
  );

  // Stryker restore all

  const sortedMessages = [...messagesPage.content].sort((a, b) => b.id - a.id);

  const userIdToUsername = userCommonsList.reduce((acc, user) => {
    acc[user.userId] = user.username || "";
    return acc;
  }, {});

  const showHistoryLink =
    (messagesPage?.totalElements ?? sortedMessages.length) >
    initialMessagePageSize;
  const historyLink = `/chat/${commonsId}`;

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          overflowY: "scroll",
          maxHeight: "300px",
        }}
        data-testid="ChatDisplay"
      >
        {Array.isArray(sortedMessages) &&
          sortedMessages.slice(0, initialMessagePageSize).map((message) => (
            <ChatMessageDisplay
              key={message.id}
              message={{
                ...message,
                username: userIdToUsername[message.userId],
              }}
            />
          ))}
      </div>
      {showHistoryLink && (
        <div
          style={{
            textAlign: "center",
            padding: "0.75rem 0 0.25rem",
            fontSize: "0.9rem",
            color: "#0d6efd",
          }}
          data-testid="ChatDisplay-HistoryLink"
        >
          <Link to={historyLink} style={{ textDecoration: "none" }}>
            View full chat history
          </Link>
        </div>
      )}
    </>
  );
};

export default ChatDisplay;
