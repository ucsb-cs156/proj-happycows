import { Button, Form } from "react-bootstrap";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useBackend } from "main/utils/useBackend";
import GameSelect from "main/components/Game/GameSelect";

function SetCowHealthForm({
  submitAction = () => {},
  testid = "SetCowHealthForm",
}) {
  const localHealthValue = localStorage.getItem(`${testid}-health`);
  const [healthValue, setHealthValue] = useState(localHealthValue || 100);

  const { data: game } = useBackend(
    ["/api/game/all"],
    { url: "/api/game/all" },
    [],
  );

  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedGameName, setSelectedGameName] = useState(null);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const handleHealthValueChange = (e) => {
    const newValue = e.target.value;
    setHealthValue(newValue);
    localStorage.setItem(`${testid}-health`, newValue);
  };

  const handleGameSelection = (id, name) => {
    setSelectedGame(id);
    setSelectedGameName(name);
  };

  const onSubmit = () => {
    const params = { selectedGame, healthValue, selectedGameName };
    submitAction(params);
  };

  if (!game || game.length === 0) {
    return <div>There are no games on which to run this job.</div>;
  }

  if (selectedGame === null) {
    setSelectedGame(game[0].id);
    setSelectedGameName(game[0].name);
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group className="mb-3">
        <Form.Text htmlFor="description">
          Set the cow health for all cows in a single game.
        </Form.Text>
      </Form.Group>

      <GameSelect
        game={game}
        selectedGame={selectedGame}
        handleGameSelection={handleGameSelection}
        testid={testid}
      />

      <Form.Group className="mb-3">
        <Form.Label htmlFor="healthValue">Health [0-100]</Form.Label>
        <Form.Control
          data-testid={`${testid}-healthValue`}
          id="healthValue"
          type="number"
          step="1"
          value={healthValue}
          {...register("healthValue", {
            required: "Health Value is required",
            min: { value: 0, message: "Health Value must be ≥ 0" },
            max: { value: 100, message: "Health Value must be ≤ 100" },
          })}
          onChange={handleHealthValueChange}
        />
        <Form.Control.Feedback type="invalid">
          {errors.healthValue?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Button type="submit" data-testid="SetCowHealthForm-Submit-Button">
        Set Cow Health
      </Button>
    </Form>
  );
}

export default SetCowHealthForm;
