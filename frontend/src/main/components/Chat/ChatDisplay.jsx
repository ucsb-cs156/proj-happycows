import React from "react";
import ChatMessageDisplay from "main/components/Chat/ChatMessageDisplay";
import { useBackend } from "main/utils/useBackend";
import { useState } from "react";

// Props for storybook manual injection

const ChatDisplay = ({ commonsId }) => {
  const initialMessagePageSize = 10;
  const refreshRate = 500;

  const [tempPage, setTempPage] = useState(0);

  const chatElement = document.querySelector('[data-testid="ChatDisplay"]');

  const loadPages = () => {
    if(chatElement.clientHeight <= 60){
      alert("No more messages.");
      setTempPage(tempPage - 1);
    }
    else{
      setTempPage(tempPage + 1);
    }
  }

  const reloadPages = () => {
    setTempPage(tempPage - 1);
  }

  // Stryker disable all

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
      <button onClick={reloadPages}>Reload messages.</button>
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
        <button onClick={loadPages}>Load more messages.</button>
    </div>
  ) : 
  (<div
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
      <button onClick={loadPages}>Load more messages.</button>
  </div>
  );
};

export default ChatDisplay;

