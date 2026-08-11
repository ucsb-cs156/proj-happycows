import React from "react";
import ChatMessageDisplay from "main/components/Chat/ChatMessageDisplay";
import { useBackend } from "main/utils/useBackend";
import { Link } from "react-router";

// Props for storybook manual injection

const ChatDisplay = ({ gameId }) => {
  const initialMessagePageSize = 10;
  const refreshRate = 2000;

  const { data: messagesPage } = useBackend(
    [`/api/chat/get?page=0&size=${initialMessagePageSize}&gameId=${gameId}`],
    {
      method: "GET",
      url: `/api/chat/get`,
      params: {
        gameId: gameId,
        page: 0,
        size: initialMessagePageSize,
      },
    },
    { content: [], totalElements: 0 },
    { refetchInterval: refreshRate },
  );

  const { data: farmerList } = useBackend(
    [`/api/farmer/game/all`],
    {
      method: "GET",
      url: "/api/farmer/game/all",
      params: {
        gameId: gameId,
      },
    },
    [],
    { refetchInterval: refreshRate },
  );

  const messageContent = Array.isArray(messagesPage?.content)
    ? messagesPage.content
    : undefined;
  const sortedMessages = Array.isArray(messageContent)
    ? [...messageContent].sort((a, b) => b.id - a.id)
    : null;

  const userIdToUsername = Array.isArray(farmerList)
    ? farmerList.reduce((acc, user) => {
        acc[user.userId] = user.username || "";
        return acc;
      }, {})
    : {};

  const totalElements =
    typeof messagesPage?.totalElements === "number"
      ? messagesPage.totalElements
      : undefined;
  const messageCount = Array.isArray(sortedMessages)
    ? sortedMessages.length
    : 0;
  const showHistoryLink =
    (totalElements ?? messageCount) > initialMessagePageSize;
  const historyLink = `/chat/${gameId}`;

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
        {(Array.isArray(sortedMessages) ? sortedMessages : [])
          .slice(0, initialMessagePageSize)
          .map((message) => (
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
