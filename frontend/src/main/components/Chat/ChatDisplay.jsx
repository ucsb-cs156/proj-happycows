import React from "react";
import ChatMessageDisplay from "main/components/Chat/ChatMessageDisplay";
import { useBackend } from "main/utils/useBackend";
import { useState, useEffect } from "react";

// Props for storybook manual injection

const ChatDisplay = ({ commonsId }) => {
  const initialMessagePageSize = 100;
  const refreshRate = 500;

  // Stryker disable all

  const [tempPage, setTempPage] = useState(0);
  const [prevPage, setPrevPage] = useState(0);

  const loadPages = () => {
    setPrevPage(tempPage);
    setTempPage((tempPage) => tempPage + 1);
  };

  const reloadPages = () => {
    setPrevPage(tempPage);
    setTempPage((tempPage) => tempPage - 1);
  };

  const { data: messagesPage } = useBackend(
    [`/api/chat/get`],
    {
      method: "GET",
      url: `/api/chat/get`,
      params: {
        commonsId: commonsId,
        page: tempPage,
        size: initialMessagePageSize,
      },
    },
    { content: [] },
    { refetchInterval: refreshRate },
  );

  useEffect(() => {
    if (tempPage == prevPage) {
      return;
    }
    if (messagesPage.content.length == 0 && tempPage > 0) {
      alert("No more messages.");
      setTempPage((tempPage) => tempPage - 1);
    }
  }, [messagesPage, tempPage, prevPage]);

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

  const sortedMessages = messagesPage.content.sort((a, b) => b.id - a.id);

  const userIdToUsername = userCommonsList.reduce((acc, user) => {
    acc[user.userId] = user.username || "";
    return acc;
  }, {});

  return tempPage ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column-reverse",
        overflowY: "scroll",
        maxHeight: "300px",
      }}
      data-testid="ChatDisplay"
    >
      <button
        style={{
          backgroundColor: "#0d6efd",
          color: "white",
          borderColor: "#0d6efd",
          borderRadius: "8px",
        }}
        data-testid="reload-button"
        onClick={reloadPages}
      >
        Reload messages.
      </button>
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
      <button
        style={{
          backgroundColor: "#0d6efd",
          color: "white",
          borderColor: "#0d6efd",
          borderRadius: "8px",
        }}
        data-testid="load-button"
        onClick={loadPages}
      >
        Load more messages.
      </button>
    </div>
  ) : (
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
      <button
        style={{
          backgroundColor: "#0d6efd",
          color: "white",
          borderColor: "#0d6efd",
          borderRadius: "8px",
        }}
        data-testid="load-button"
        onClick={loadPages}
      >
        Load more messages.
      </button>
    </div>
  );
};

export default ChatDisplay;
