package edu.ucsb.cs156.happiercows.jobs;

import java.time.LocalDateTime;

import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.Profit;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.ProfitRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.jobs.services.JobContext;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
public class MilkTheCowsJob implements JobContextConsumer {

    @Getter
    private GameRepository gameRepository;
    @Getter
    private FarmerRepository farmerRepository;
    @Getter
    private UserRepository userRepository;
    @Getter
    private ProfitRepository profitRepository;

    public static String formatDollars(double amount) {
        return  String.format("$%.2f", amount);
    }

    @Override
    public void accept(JobContext ctx) throws Exception {
        ctx.log("Starting to milk the cows");

        Iterable<Game> allGame = gameRepository.findAll();

        for (Game game : allGame) {
            if (!GameGate.shouldProcess(game, gameRepository, ctx)) {
                continue;
            }
            String name = game.getName();
            double milkPrice = game.getMilkPrice();
            ctx.log("Milking cows for Game: " + name + ", Milk Price: " + formatDollars(milkPrice));

            Iterable<Farmer> allFarmer = farmerRepository.findByGameId(game.getId());

            for (Farmer farmer : allFarmer) {
                milkCows(ctx, game, farmer, profitRepository, farmerRepository);
            }
        }

        ctx.log("Cows have been milked!");
    }

    /** This method performs the function of milking the cows for a single farmer.
     *  It is a public method only so it can be exposed to the unit tests
     * @param ctx the JobContext
     * @param game the Game
     * @param farmer the Farmer
     *
     */

    public static void milkCows(JobContext ctx, Game game, Farmer farmer, ProfitRepository profitRepository, FarmerRepository farmerRepository) {
        User user = farmer.getUser();

        ctx.log("User: " + user.getFullName()
                + ", numCows: " + farmer.getNumOfCows()
                + ", cowHealth: " + farmer.getCowHealth()
                + ", totalWealth: " + formatDollars(farmer.getTotalWealth()));

        double profitAmount = calculateMilkingProfit(game, farmer);
        Profit profit = Profit.builder()
                .farmer(farmer)
                .amount(profitAmount)
                .timestamp(LocalDateTime.now())
                .numCows(farmer.getNumOfCows())
                .avgCowHealth(farmer.getCowHealth())
                .build();
        double newWeath = farmer.getTotalWealth() + profitAmount;
        farmer.setTotalWealth(newWeath);
        farmerRepository.save(farmer);
        profit = profitRepository.save(profit);
        ctx.log("Profit for user: " + user.getFullName()
                + " is: " + formatDollars(profitAmount)
                + ", newWealth: " + formatDollars(newWeath));
    }

    /**
     * Calculate the profit for a user from milking their cows.
     *
     * @param farmer
     * @return
     */
    public static double calculateMilkingProfit(Game game, Farmer farmer) {
        double milkPrice = game.getMilkPrice();
        double profit = farmer.getNumOfCows() * (farmer.getCowHealth() / 100.0) * milkPrice;
        return profit;
    }
}
