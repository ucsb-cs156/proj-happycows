import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import GameForm from "main/components/Game/GameForm";
import { Navigate } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function GameEditPage() {
  let { id } = useParams();

  const {
    data: game,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/game?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so changing this to "" doesn't introduce a bug
      method: "GET",
      url: `/api/game`,
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (game) => ({
    url: "/api/game/update",
    method: "PUT",
    params: {
      id: game.id,
    },
    data: {
      name: game.name,
      startingBalance: game.startingBalance,
      cowPrice: game.cowPrice,
      milkPrice: game.milkPrice,
      startingDate: game.startingDate,
      lastDate: game.lastDate,
      degradationRate: game.degradationRate,
      capacityPerUser: game.capacityPerUser,
      carryingCapacity: game.carryingCapacity,
      aboveCapacityHealthUpdateStrategy: game.aboveCapacityHealthUpdateStrategy,
      belowCapacityHealthUpdateStrategy: game.belowCapacityHealthUpdateStrategy,
      showLeaderboard: game.showLeaderboard,
      showChat: game.showChat,
      hidden: game.hidden,
      courseId: game.courseId,
    },
  });

  const onSuccess = (_, game) => {
    toast(`Game Updated - id: ${game.id} name: ${game.name}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/game?id=${id}`],
  );

  const { isSuccess } = mutation;

  const submitAction = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess) {
    return <Navigate to={`/admin/listgamev2?focus=${id}`} />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Game</h1>
        {game && (
          <GameForm
            initialGame={game}
            submitAction={submitAction}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
