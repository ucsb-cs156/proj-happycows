import { Button, Form } from "react-bootstrap";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useBackend } from "main/utils/useBackend";
import GameSelect from "main/components/Game/GameSelect";

function UpdateCowHealthForm({ submitAction, testid = "UpdateCowHealthForm" }) {
  // Stryker restore all

  const { data: gameAll } = useBackend(
    ["/api/game/all"],
    { url: "/api/game/all" },
    [],
  );

  const allGameProp = { id: 0, name: "All Games" };

  const game = [allGameProp, ...gameAll];

  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedGameName, setSelectedGameName] = useState(null);

  const { handleSubmit } = useForm();

  const handleGameSelection = (id, name) => {
    setSelectedGame(id);
    setSelectedGameName(name);
  };

  const onSubmit = () => {
    const params = { selectedGame, selectedGameName };
    submitAction(params);
  };

  if (selectedGame === null) {
    setSelectedGame(game[0].id);
    setSelectedGameName(game[0].name);
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group className="mb-3">
        <Form.Text htmlFor="description">
          Updated the cows' health in a single or all games.
        </Form.Text>
      </Form.Group>

      <GameSelect
        game={game}
        selectedGame={selectedGame}
        handleGameSelection={handleGameSelection}
        testid={testid}
      />

      <Button type="submit" data-testid="UpdateCowHealthForm-Submit-Button">
        Update
      </Button>
    </Form>
  );
}

export default UpdateCowHealthForm;
