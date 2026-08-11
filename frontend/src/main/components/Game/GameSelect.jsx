import { Form } from "react-bootstrap";

function GameSelect({
  game,
  handleGameSelection,
  selectedGame,
  testid = "GameSelect",
}) {
  return (
    <Form.Group className="mb-3">
      <Form.Text htmlFor="game" className="fw-bold fs-5">
        Game
      </Form.Text>
      <div className="ms-3" data-testid={`${testid}-GameSelect-div`}>
        {game.map((object) => (
          <Form.Check
            key={object.id}
            type="radio"
            label={object.name}
            data-testid={`${testid}-game-${object.id}`}
            onChange={() => handleGameSelection(object.id, object.name)}
            checked={selectedGame === object.id}
          />
        ))}
      </div>
    </Form.Group>
  );
}

export default GameSelect;
