package edu.ucsb.cs156.happiercows.jobs;

import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.GamePlus;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.jobs.services.JobContext;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;
import edu.ucsb.cs156.happiercows.services.GamePlusBuilderService;
import edu.ucsb.cs156.happiercows.strategies.CowHealthUpdateStrategy;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
public class UpdateCowHealthJob implements JobContextConsumer {

    @Getter
    private GameRepository gameRepository;
    @Getter
    private FarmerRepository farmerRepository;
    @Getter
    private UserRepository userRepository;
    @Getter
    private GamePlusBuilderService gamePlusBuilderService;

    @Override
    public void accept(JobContext ctx) throws Exception {
        ctx.log("Updating cow health...");


        Iterable<Game> allGame = gameRepository.findAll();
        Iterable<GamePlus> allGamePlus = gamePlusBuilderService.convertToGamePlus(allGame);

        for (GamePlus gamePlus : allGamePlus) {


            Game game = gamePlus.getGame();

            if (!GameGate.shouldProcess(game, gameRepository, ctx)) {
                continue;
            }

            runUpdateJobInGame(game, gamePlus, gamePlusBuilderService, gameRepository, farmerRepository, ctx);

        }

        ctx.log("Cow health has been updated!");
    }

    // exposed for testing
    public static double calculateNewCowHealthUsingStrategy(
            CowHealthUpdateStrategy strategy,
            GamePlus gamePlus,
            Farmer farmer,
            int totalCows
    ) {
        var health = strategy.calculateNewCowHealth(gamePlus, farmer, totalCows);
        return Math.max(0, Math.min(health, 100));
    }

    public static void calculateCowDeaths(Farmer farmer, JobContext ctx) {
        if (farmer.getCowHealth() == 0.0) {
            farmer.setCowDeaths(farmer.getCowDeaths() + farmer.getNumOfCows());
            farmer.setNumOfCows(0);
            farmer.setCowHealth(100.0);

            ctx.log(" " + farmer.getCowDeaths() + " cows for this user died." );
        }
    }

    public static void runUpdateJobInGame(Game game, GamePlus gamePlus, GamePlusBuilderService gamePlusBuilderService, GameRepository gameRepository, FarmerRepository farmerRepository, JobContext ctx){
        ctx.log("Game " + game.getName() + ", degradationRate: " + game.getDegradationRate() + ", effectiveCapacity: " + gamePlus.getEffectiveCapacity());

            int numUsers = gameRepository.getNumUsers(game.getId()).orElseThrow(() -> new RuntimeException("Error calling getNumUsers(" + game.getId() + ")"));

            if (numUsers==0) {
                ctx.log("No users in this game, skipping");
                return;
            }

            int carryingCapacity = gamePlus.getEffectiveCapacity();
            Iterable<Farmer> allFarmer = farmerRepository.findByGameId(game.getId());

            Integer totalCows = gameRepository.getNumCows(game.getId()).orElseThrow(() -> new RuntimeException("Error calling getNumCows(" + game.getId() + ")"));

            var isAboveCapacity = totalCows > carryingCapacity;
            var cowHealthUpdateStrategy = isAboveCapacity ? game.getAboveCapacityHealthUpdateStrategy() : game.getBelowCapacityHealthUpdateStrategy();

            for (Farmer farmer : allFarmer) {
                User user = farmer.getUser();

                var newCowHealth = calculateNewCowHealthUsingStrategy(cowHealthUpdateStrategy, gamePlusBuilderService.toGamePlus(game), farmer, totalCows);
                ctx.log("User: " + user.getFullName() + ", numCows: " + farmer.getNumOfCows() + ", cowHealth: " + farmer.getCowHealth());

                double oldHealth = farmer.getCowHealth();
                farmer.setCowHealth(newCowHealth);
                calculateCowDeaths(farmer, ctx);

                ctx.log(" old cow health: " + oldHealth + ", new cow health: " + farmer.getCowHealth());
                farmerRepository.save(farmer);
            }

    }
}
