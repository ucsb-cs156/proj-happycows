import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useBackend } from "main/utils/useBackend";
import GameSelect from "main/components/Game/GameSelect";

function InstructorReportSpecificGameForm({ submitAction }) {
  const testid = "InstructorReportSpecificGameForm";

  const { data: game } = useBackend(
    ["/api/game/all"],
    { url: "/api/game/all" },
    [],
  );

  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedGameName, setSelectedGameName] = useState(null);

  const {
    handleSubmit,
    formState: { _errors },
  } = useForm();

  const handleGameSelection = (id, name) => {
    setSelectedGame(id);
    setSelectedGameName(name);
  };

  const onSubmit = () => {
    const params = { selectedGame, selectedGameName };
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
      <GameSelect
        game={game}
        selectedGame={selectedGame}
        handleGameSelection={handleGameSelection}
        testid={testid}
      />
      <p>
        Click this button to generate an instructor report for the selected
        game.
      </p>
      <Button
        type="submit"
        data-testid="InstructorReportSpecificGameForm-Submit-Button"
      >
        Generate
      </Button>
    </Form>
  );
}
export default InstructorReportSpecificGameForm;
