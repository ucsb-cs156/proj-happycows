import React from "react";
import { Link } from "react-router-dom";
import ChatMessageDisplay from "main/components/Chat/ChatMessageDisplay";
import { useBackend } from "main/utils/useBackend";

// Props for storybook manual injection

const ChatDisplay = ({ commonsId }) => {
  const initialMessagePageSize = 10;
  const refreshRate = 2000;

  // Stryker disable all

  const { data: messagesPage } = useBackend(
    [`/api/chat/get`],
    {
      method: "GET",
      url: `/api/chat/get`,
      params: {
        commonsId: commonsId,
        page: 0,
        size: initialMessagePageSize,
      },
    },
    { content: [], totalElements: 0 }, // added totalElements to track total msg count
    { refetchInterval: refreshRate }
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

  const sortedMessages = (messagesPage.content || []).sort((a, b) => b.id - a.id);

  const userIdToUsername = userCommonsList.reduce((acc, user) => {
    acc[user.userId] = user.username || "";
    return acc;
  }, {});

  const totalElements = messagesPage.totalElements || 0;
  const hasMoreMessages = totalElements > initialMessagePageSize;

  return (
    <div data-testid="ChatDisplay">
      {hasMoreMessages && (
        <div
          style={{
            padding: "8px",
            textAlign: "center",
            backgroundColor: "#f8f9fa",
            borderBottom: "1px solid #dee2e6",
          }}
          data-testid="ChatDisplay-viewAll"
        >
          <Link to={`/chat/${commonsId}`}>
            View all {totalElements} messages
          </Link>
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          overflowY: "scroll",
          maxHeight: "300px",
        }}
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
    </div>
  );
};

export default ChatDisplay;
