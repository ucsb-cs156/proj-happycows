import React, { useState, useEffect, useRef } from "react";
import ChatMessageDisplay from "main/components/Chat/ChatMessageDisplay";
import { useBackend } from "main/utils/useBackend";

const ChatDisplay = ({ commonsId }) => {
  const [messages, setMessages] = useState([]);

  const [page, setPage] = useState(0);

  const [isLastPage, setIsLastPage] = useState(false);

  const processedMessageIds = useRef(new Set());

  // Stryker disable all
  const { data: messagesPage } = useBackend(
    ["/api/chat/get", page],
    {
      method: "GET",
      url: "/api/chat/get",
      params: {
        commonsId: commonsId,
        page: page,
        size: 10,
      },
    },
    { content: [], last: true },
  );

  const { data: userCommonsList } = useBackend(
    ["/api/usercommons/commons/all", commonsId],
    {
      method: "GET",
      url: "/api/usercommons/commons/all",
      params: { commonsId },
    },
    [],
  );

  useEffect(() => {
    // if (!messagesPage || !messagesPage.content) return;

    const newMessages = messagesPage.content.filter((msg) => {
      if (processedMessageIds.current.has(msg.id)) return false;
      processedMessageIds.current.add(msg.id);
      return true;
    });

    if (newMessages.length === 0) return;

    setMessages((old) => [...old, ...newMessages]);
    setIsLastPage(messagesPage.last);
  }, [messagesPage]);

  // Stryker restore all
  const userIdToUsername = userCommonsList.reduce((acc, user) => {
    acc[user.userId] = user.username || "";
    return acc;
  }, {});

  const sortedMessages = [...messages].sort((a, b) => b.id - a.id);

  return (
    <div
      data-testid="ChatDisplay"
      style={{
        display: "flex",
        flexDirection: "column-reverse",
        overflowY: "scroll",
        maxHeight: "300px",
      }}
    >
      {sortedMessages.map((message) => (
        <ChatMessageDisplay
          key={message.id}
          message={{
            ...message,
            username: userIdToUsername[message.userId],
          }}
        />
      ))}

      {!isLastPage ? (
        <button
          data-testid="MoreMessagesButton"
          onClick={() => setPage(page + 1)}
        >
          More messages
        </button>
      ) : (
        <div data-testid="NoMoreMessages">[no more messages]</div>
      )}
    </div>
  );
};

export default ChatDisplay;
