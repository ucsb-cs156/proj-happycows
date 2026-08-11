import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import GameForm from "main/components/Game/GameForm";
import { Navigate } from "react-router";
import { toast } from "react-toastify";

import { useBackendMutation } from "main/utils/useBackend";

const AdminCreateGamePage = () => {
  const objectToAxiosParams = (newGame) => ({
    url: "/api/game/new",
    method: "POST",
    data: newGame,
  });

  const onSuccess = (game) => {
    toast(
      <div>
        Game successfully created!
        <br />
        {`id: ${game.id}`}
        <br />
        {`name: ${game.name}`}
        <br />
        {`startDate: ${game.startingDate}`}
        <br />
        {`lastDate: ${game.lastDate}`}
        <br />
        {`cowPrice: ${game.cowPrice}`}
        <br />
        {`capacityPerUser: ${game.capacityPerUser}`}
        <br />
        {`carryingCapacity: ${game.carryingCapacity}`}
      </div>,
    );
  };

  // Stryker disable all
  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/game/all"],
  );
  // Stryker restore all

  const submitAction = async (data) => {
    mutation.mutate(data);
  };

  if (mutation.isSuccess) {
    return <Navigate to="/" />;
  }

  return (
    <BasicLayout>
      <h2>Create Game</h2>
      <GameForm submitAction={submitAction} />
    </BasicLayout>
  );
};

export default AdminCreateGamePage;
