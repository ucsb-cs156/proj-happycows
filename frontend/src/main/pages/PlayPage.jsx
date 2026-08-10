import React, { useState } from "react";
import { Container, CardGroup, Button } from "react-bootstrap";
import { useParams } from "react-router";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import CommonsOverview from "main/components/Commons/CommonsOverview";
import CommonsPlay from "main/components/Commons/CommonsPlay";
import FarmStats from "main/components/Commons/FarmStats";
import ManageCows from "main/components/Commons/ManageCows";
import Profits from "main/components/Commons/Profits";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { hasRole } from "main/utils/currentUser";
import { useCurrentUser } from "main/utils/currentUser";
import Background from "../../assets/PlayPageBackground.jpg";
import ChatPanel from "main/components/Chat/ChatPanel";
import ManageCowsModal from "main/components/Commons/ManageCowsModal";

export default function PlayPage() {
  const { commonsId } = useParams();
  const { data: currentUser } = useCurrentUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState();
  const [numCows, setNumCows] = useState(1);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Stryker disable all
  const { data: farmer, error: farmerError } = useBackend(
    [`/api/farmer/forcurrentuser?commonsId=${commonsId}`],
    {
      method: "GET",
      url: "/api/farmer/forcurrentuser",
      params: {
        commonsId: commonsId,
      },
    },
  );
  // Stryker restore all

  // Stryker disable all
  const { data: commonsPlus } = useBackend(
    [`/api/commons/plus?id=${commonsId}`],
    {
      method: "GET",
      url: "/api/commons/plus",
      params: {
        id: commonsId,
      },
    },
  );
  // Stryker restore all

  // Stryker disable all
  const { data: currentAnnouncements } = useBackend(
    [`/api/announcements/current?commonsId=${commonsId}`],
    {
      method: "GET",
      url: "/api/announcements/current",
      params: {
        commonsId: commonsId,
      },
    },
  );
  // Stryker restore all

  const commonsPlusExists = !(typeof commonsPlus == "undefined");
  let commonsforuser;
  let matched;

  if (commonsPlusExists) {
    commonsforuser = currentUser.root.user.commons;
    matched = commonsforuser.some((com) => com.id === commonsPlus.commons.id);
  }

  const farmerErrorResponse = farmerError?.response ?? {};
  const farmerErrorData = farmerErrorResponse.data ?? {};
  const deniedAccess =
    farmerErrorResponse.status === 403 &&
    farmerErrorData.type ===
      "NotEnrolledInCourseAssociatedWithCommonsException";
  const allowed =
    commonsPlusExists &&
    matched &&
    !commonsPlus.commons.hidden &&
    !deniedAccess;
  const notallowed = commonsPlusExists && !matched && !deniedAccess;
  const hidden = commonsPlusExists && commonsPlus.commons.hidden;

  // Stryker disable all
  const { data: farmerProfits } = useBackend(
    [`/api/profits/all/commonsid?commonsId=${commonsId}`],
    {
      method: "GET",
      url: "/api/profits/all/commonsid",
      params: {
        commonsId: commonsId,
      },
    },
  );
  // Stryker restore all

  // Stryker disable all
  const objectToAxiosParamsBuy = (newFarmer) => ({
    url: "/api/farmer/buy",
    method: "PUT",
    data: newFarmer,
    params: {
      commonsId: commonsId,
      numCows: numCows,
    },
  });
  // Stryker restore all

  // Stryker disable all
  const mutationbuy = useBackendMutation(objectToAxiosParamsBuy, null, [
    `/api/farmer/forcurrentuser?commonsId=${commonsId}`,
  ]);
  // Stryker restore all

  const onBuy = (farmer, numCows) => {
    mutationbuy.mutate(farmer, numCows);
  };

  const onSuccessSell = () => {};

  // Stryker disable all
  const objectToAxiosParamsSell = (newFarmer) => ({
    url: "/api/farmer/sell",
    method: "PUT",
    data: newFarmer,
    params: {
      commonsId: commonsId,
      numCows: numCows,
    },
  });
  // Stryker restore all

  // Stryker disable all
  const mutationsell = useBackendMutation(
    objectToAxiosParamsSell,
    { onSuccess: onSuccessSell },
    [`/api/farmer/forcurrentuser?commonsId=${commonsId}`],
  );
  // Stryker restore all

  const onSell = (farmer, numCows) => {
    mutationsell.mutate(farmer, numCows);
  };

  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChatWindow = () => {
    setIsChatOpen((prevState) => !prevState);
  };

  const chatButtonStyle = {
    width: "60px",
    height: "60px",
    borderRadius: "25%",
    backgroundColor: "lightblue",
    color: "black",
    position: "fixed",
    bottom: "30px",
    right: "30px",
  };

  const chatContainerStyle = {
    width: "550px",
    position: "fixed",
    bottom: "100px",
    right: "20px",
  };

  const emojiStyle = {
    fontFamily: "Arial, sans-serif",
    fontSize: "30px",
  };

  return (
    <div
      style={{
        backgroundSize: "cover",
        backgroundImage: `url(${Background})`,
      }}
      data-testid="playpage-div"
    >
      <BasicLayout>
        <Container>
          {!commonsPlus && <h1>This game does not exist!</h1>}
          {deniedAccess && (
            <h1>
              You do not currently have access to this Game. Please contact your
              instructor if you think this is an error
            </h1>
          )}
          {notallowed && <h1>You have yet to join this game!</h1>}
          {hidden && (
            <h1>This game has been hidden by the site administrator.</h1>
          )}

          {allowed && !!currentUser && (
            <CommonsPlay currentUser={currentUser} />
          )}

          {allowed && !!commonsPlus && (
            <CommonsOverview
              commonsPlus={commonsPlus}
              currentUser={currentUser}
              currentAnnouncements={currentAnnouncements}
            />
          )}

          <br />

          {allowed && !!farmer && !!commonsPlus && (
            <CardGroup>
              <ManageCows
                farmer={farmer}
                commons={commonsPlus.commons}
                setMessage={setMessage}
                openModal={openModal}
              />
              <FarmStats farmer={farmer} />
              <Profits farmer={farmer} profits={farmerProfits} />
              <ManageCowsModal
                number={numCows}
                setNumber={setNumCows}
                farmer={farmer}
                isOpen={isModalOpen}
                message={message}
                onClose={closeModal}
                onBuy={onBuy}
                onSell={onSell}
              />
            </CardGroup>
          )}
        </Container>
      </BasicLayout>

      {(hasRole(currentUser, "ROLE_ADMIN") ||
        (allowed && !!commonsPlus && commonsPlus.commons.showChat)) && (
        <div style={chatContainerStyle} data-testid="playpage-chat-div">
          {!!isChatOpen && <ChatPanel commonsId={commonsId} />}
          <Button
            style={chatButtonStyle}
            onClick={toggleChatWindow}
            data-testid="playpage-chat-toggle"
          >
            {isChatOpen ? (
              <span style={emojiStyle} data-testid="close-icon">
                ❌
              </span>
            ) : (
              <span style={emojiStyle} data-testid="message-icon">
                💬
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
