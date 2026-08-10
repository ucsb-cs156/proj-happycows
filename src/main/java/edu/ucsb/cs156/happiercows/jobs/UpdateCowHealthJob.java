package edu.ucsb.cs156.happiercows.jobs;

import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.CommonsPlus;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.jobs.services.JobContext;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;
import edu.ucsb.cs156.happiercows.services.CommonsPlusBuilderService;
import edu.ucsb.cs156.happiercows.strategies.CowHealthUpdateStrategy;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
public class UpdateCowHealthJob implements JobContextConsumer {

    @Getter
    private CommonsRepository commonsRepository;
    @Getter
    private FarmerRepository farmerRepository;
    @Getter
    private UserRepository userRepository;
    @Getter
    private CommonsPlusBuilderService commonsPlusBuilderService;

    @Override
    public void accept(JobContext ctx) throws Exception {
        ctx.log("Updating cow health...");


        Iterable<Commons> allCommons = commonsRepository.findAll();
        Iterable<CommonsPlus> allCommonsPlus = commonsPlusBuilderService.convertToCommonsPlus(allCommons);

        for (CommonsPlus commonsPlus : allCommonsPlus) {


            Commons commons = commonsPlus.getCommons();

            if (!CommonsGate.shouldProcess(commons, commonsRepository, ctx)) {
                continue;
            }

            runUpdateJobInCommons(commons, commonsPlus, commonsPlusBuilderService, commonsRepository, farmerRepository, ctx);

        }

        ctx.log("Cow health has been updated!");
    }

    // exposed for testing
    public static double calculateNewCowHealthUsingStrategy(
            CowHealthUpdateStrategy strategy,
            CommonsPlus commonsPlus,
            Farmer farmer,
            int totalCows
    ) {
        var health = strategy.calculateNewCowHealth(commonsPlus, farmer, totalCows);
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

    public static void runUpdateJobInCommons(Commons commons, CommonsPlus commonsPlus, CommonsPlusBuilderService commonsPlusBuilderService, CommonsRepository commonsRepository, FarmerRepository farmerRepository, JobContext ctx){
        ctx.log("Commons " + commons.getName() + ", degradationRate: " + commons.getDegradationRate() + ", effectiveCapacity: " + commonsPlus.getEffectiveCapacity());

            int numUsers = commonsRepository.getNumUsers(commons.getId()).orElseThrow(() -> new RuntimeException("Error calling getNumUsers(" + commons.getId() + ")"));

            if (numUsers==0) {
                ctx.log("No users in this commons, skipping");
                return;
            }

            int carryingCapacity = commonsPlus.getEffectiveCapacity();
            Iterable<Farmer> allFarmer = farmerRepository.findByCommonsId(commons.getId());

            Integer totalCows = commonsRepository.getNumCows(commons.getId()).orElseThrow(() -> new RuntimeException("Error calling getNumCows(" + commons.getId() + ")"));

            var isAboveCapacity = totalCows > carryingCapacity;
            var cowHealthUpdateStrategy = isAboveCapacity ? commons.getAboveCapacityHealthUpdateStrategy() : commons.getBelowCapacityHealthUpdateStrategy();

            for (Farmer farmer : allFarmer) {
                User user = farmer.getUser();

                var newCowHealth = calculateNewCowHealthUsingStrategy(cowHealthUpdateStrategy, commonsPlusBuilderService.toCommonsPlus(commons), farmer, totalCows);
                ctx.log("User: " + user.getFullName() + ", numCows: " + farmer.getNumOfCows() + ", cowHealth: " + farmer.getCowHealth());

                double oldHealth = farmer.getCowHealth();
                farmer.setCowHealth(newCowHealth);
                calculateCowDeaths(farmer, ctx);

                ctx.log(" old cow health: " + oldHealth + ", new cow health: " + farmer.getCowHealth());
                farmerRepository.save(farmer);
            }

    }
}
