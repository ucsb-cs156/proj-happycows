import React from "react";
import { Stack } from "react-bootstrap";
import ChatMessageCreate from "main/components/Chat/ChatMessageCreate";
import ChatDisplay from "main/components/Chat/ChatDisplay";

const ChatPanel = ({ gameId }) => {
  return (
    <Stack gap={2} style={{ backgroundColor: "white" }} data-testid="ChatPanel">
      <ChatDisplay gameId={gameId} />
      <ChatMessageCreate gameId={gameId} />
    </Stack>
  );
};

export default ChatPanel;
