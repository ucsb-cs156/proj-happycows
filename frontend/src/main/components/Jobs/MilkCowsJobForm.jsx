import { Button, Form } from "react-bootstrap";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useBackend } from "main/utils/useBackend";
import GameSelect from "main/components/Game/GameSelect";

function MilkTheCowsForm({ submitAction, testid = "MilkTheCowsForm" }) {
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

  // TODO: calculate the selected game with regular variable instead of setting state in render
  if (selectedGame === null) {
    setSelectedGame(game[0].id);
    setSelectedGameName(game[0].name);
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group className="mb-3">
        <Form.Text htmlFor="description">
          Milk the cows in a single or all games.
        </Form.Text>
      </Form.Group>

      <GameSelect
        game={game}
        selectedGame={selectedGame}
        handleGameSelection={handleGameSelection}
        testid={testid}
      />

      <Button type="submit" data-testid="MilkTheCowsForm-Submit-Button">
        Milk the cows!
      </Button>
    </Form>
  );
}

export default MilkTheCowsForm;
