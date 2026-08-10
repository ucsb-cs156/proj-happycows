package edu.ucsb.cs156.happiercows.jobs;

import java.time.LocalDateTime;

import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.Profit;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
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
    private CommonsRepository commonsRepository;
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

        Iterable<Commons> allCommons = commonsRepository.findAll();

        for (Commons commons : allCommons) {
            if (!CommonsGate.shouldProcess(commons, commonsRepository, ctx)) {
                continue;
            }
            String name = commons.getName();
            double milkPrice = commons.getMilkPrice();
            ctx.log("Milking cows for Commons: " + name + ", Milk Price: " + formatDollars(milkPrice));

            Iterable<Farmer> allFarmer = farmerRepository.findByCommonsId(commons.getId());

            for (Farmer farmer : allFarmer) {
                milkCows(ctx, commons, farmer, profitRepository, farmerRepository);
            }
        }

        ctx.log("Cows have been milked!");
    }

    /** This method performs the function of milking the cows for a single farmer.
     *  It is a public method only so it can be exposed to the unit tests
     * @param ctx the JobContext
     * @param commons the Commons
     * @param farmer the Farmer
     *
     */

    public static void milkCows(JobContext ctx, Commons commons, Farmer farmer, ProfitRepository profitRepository, FarmerRepository farmerRepository) {
        User user = farmer.getUser();

        ctx.log("User: " + user.getFullName()
                + ", numCows: " + farmer.getNumOfCows()
                + ", cowHealth: " + farmer.getCowHealth()
                + ", totalWealth: " + formatDollars(farmer.getTotalWealth()));

        double profitAmount = calculateMilkingProfit(commons, farmer);
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
    public static double calculateMilkingProfit(Commons commons, Farmer farmer) {
        double milkPrice = commons.getMilkPrice();
        double profit = farmer.getNumOfCows() * (farmer.getCowHealth() / 100.0) * milkPrice;
        return profit;
    }
}
