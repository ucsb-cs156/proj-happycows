import React from "react";
import { useParams } from "react-router";
import { Container } from "react-bootstrap";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import FarmerActivityTable from "main/components/Game/FarmerActivityTable";
import { useBackend } from "main/utils/useBackend";

export default function AdminGameActivityPage() {
  const { gameId } = useParams();

  // Stryker disable all
  const { data: gamePlus } = useBackend([`/api/game/plus?id=${gameId}`], {
    method: "GET",
    url: "/api/game/plus",
    params: {
      id: gameId,
    },
  });
  // Stryker restore all

  return (
    <BasicLayout>
      <Container className="pt-2">
        <h1 data-testid="AdminGameActivityPage-title">
          Activity for <strong>{gamePlus?.game?.name}</strong>
        </h1>
        <FarmerActivityTable
          gameId={gameId}
          testid="AdminGameActivityPage-table"
        />
      </Container>
    </BasicLayout>
  );
}
