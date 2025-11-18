import React from "react";
import ChatMessageDisplay from "main/components/Chat/ChatMessageDisplay";
import { useBackend } from "main/utils/useBackend";
import { useState, useEffect, useRef } from "react";

// Props for storybook manual injection

const ChatDisplay = ({ commonsId }) => {
  const initialMessagePageSize = 10;
  const refreshRate = 200;

  const [tempPage, setTempPage] = useState(0);
  const chatElement = document.querySelector('[data-testid="ChatDisplay"]');

  if(chatElement) {
    chatElement.addEventListener("scroll", () => {
      if(chatElement.scrollTop == -520){
        try{
          console.log(tempPage);
          setTempPage(tempPage + 1);          
        }
        catch (error){
          console.log("No more messages.");
        }
      }
      else if(chatElement.scrollTop == 0 && tempPage > 0){
        try{
          console.log(tempPage);
          setTempPage(tempPage - 1);
        }
        catch (error){
          console.log("Up to date.");
        }
      }
    })
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

  return (
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
  );
};

export default ChatDisplay;

