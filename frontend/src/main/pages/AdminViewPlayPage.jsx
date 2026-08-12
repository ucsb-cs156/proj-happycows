import React, { useState } from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import { Card, Container, CardGroup, Button } from "react-bootstrap";
import GameOverview from "main/components/Game/GameOverview";
import GamePlay from "main/components/Game/GamePlay";
import FarmStats from "main/components/Game/FarmStats";
import ManageCows from "main/components/Game/ManageCows";
import Profits from "main/components/Game/Profits";
import { useBackend } from "main/utils/useBackend";
import { useCurrentUser } from "main/utils/currentUser";
import ChatPanel from "main/components/Chat/ChatPanel";

const AdminViewPlayPage = () => {
  const { userId, gameId } = useParams();

  const { data: currentUser } = useCurrentUser();

  // Stryker disable all
  const { data: farmer } = useBackend("/api/farmer", {
    method: "GET",
    url: "/api/farmer",
    params: {
      userId: userId,
      gameId: gameId,
    },
  });

  // Stryker restore all

  // Stryker disable all
  const { data: gamePlus } = useBackend([`/api/game/plus?id=${gameId}`], {
    method: "GET",
    url: "/api/game/plus",
    params: {
      id: gameId,
    },
  });
  // Stryker restore all

  // Stryker disable all
  const { data: farmerProfits } = useBackend([`/api/profits/all`], {
    method: "GET",
    url: "/api/profits/all",
    params: {
      userId: userId,
      gameId: gameId,
    },
  });
  // Stryker restore all

  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChatWindow = () => {
    setIsChatOpen((prevState) => !prevState);
  };

  const chatButtonStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "lightblue",
    color: "black",
    position: "fixed",
    bottom: "20px",
    right: "20px",
  };

  const chatContainerStyle = {
    width: "550px",
    position: "fixed",
    bottom: "100px",
    right: "20px",
  };

  const bannerStyle = {
    background: "#f0f0f0",
    padding: "10px",
    textAlign: "center",
  };

  const visiting_user = farmer?.username;
  const visiting_game = gamePlus?.game.name;
  // Stryker disable all
  const admin_name = currentUser?.root ? currentUser?.root?.user?.fullName : "";
  // Stryker restore all

  return (
    <div>
      <BasicLayout>
        <Card
          style={bannerStyle}
          data-testid="adminviewplaypage-read-only-banner"
        >
          <Card.Body>
            <Card.Title>
              This is a Admin Feature for <strong>{admin_name}</strong>
              <br />
              Visiting Farmer <strong>{visiting_user}</strong>'s Play Page for
              game <strong>{visiting_game}</strong> in Read Only Mode.
            </Card.Title>
          </Card.Body>
        </Card>
        <Container>
          {!!currentUser && <GamePlay currentUser={currentUser} />}
          {!!gamePlus && (
            <GameOverview gamePlus={gamePlus} currentUser={currentUser} />
          )}
          <br />
          {!!farmer && !!gamePlus && (
            <CardGroup data-testid="adminviewplaypage-card-group">
              <ManageCows farmer={farmer} game={gamePlus.game} />
              <FarmStats farmer={farmer} />
              <Profits farmer={farmer} profits={farmerProfits} />
            </CardGroup>
          )}
        </Container>
      </BasicLayout>
      <div style={chatContainerStyle} data-testid="adminviewplaypage-chat-div">
        {!!isChatOpen && <ChatPanel gameId={gameId} />}
        <Button
          style={chatButtonStyle}
          onClick={toggleChatWindow}
          data-testid="adminviewplaypage-chat-toggle"
        >
          {isChatOpen ? "▼" : "▲"}
        </Button>
      </div>
    </div>
  );
};

export default AdminViewPlayPage;
