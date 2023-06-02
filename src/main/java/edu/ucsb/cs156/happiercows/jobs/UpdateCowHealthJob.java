package edu.ucsb.cs156.happiercows.jobs;

import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.UserCommons;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.UserCommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.services.jobs.JobContext;
import edu.ucsb.cs156.happiercows.services.jobs.JobContextConsumer;
import edu.ucsb.cs156.happiercows.strategies.CowHealthUpdateStrategy;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
public class UpdateCowHealthJob implements JobContextConsumer {

    @Getter
    private CommonsRepository commonsRepository;
    @Getter
    private UserCommonsRepository userCommonsRepository;
    @Getter
    private UserRepository userRepository;

    @Override
    public void accept(JobContext ctx) throws Exception {
        ctx.log("Updating cow health...");

        Iterable<Commons> allCommons = commonsRepository.findAll();

        for (Commons commons : allCommons) {
            ctx.log("Commons " + commons.getName() + ", degradationRate: " + commons.getDegradationRate() + ", carryingCapacity: " + commons.getCarryingCapacity());

            int carryingCapacity = commons.getCarryingCapacity();
            Iterable<UserCommons> allUserCommons = userCommonsRepository.findByCommonsId(commons.getId());

            Integer totalCows = commonsRepository.getNumCows(commons.getId()).orElseThrow(() -> new RuntimeException("Error calling getNumCows(" + commons.getId() + ")"));

            var isAboveCapacity = totalCows > carryingCapacity;
            var cowHealthUpdateStrategy = isAboveCapacity ? commons.getAboveCapacityHealthUpdateStrategy() : commons.getBelowCapacityHealthUpdateStrategy();

            for (UserCommons userCommons : allUserCommons) {
                User user = userCommons.getUser();
                ctx.log("User: " + user.getFullName() + ", numCows: " + userCommons.getNumOfCows() + ", cowHealth: " + userCommons.getCowHealth());

                var newCowHealth = calculateNewCowHealthUsingStrategy(cowHealthUpdateStrategy, commons, userCommons, totalCows);
                ctx.log(" old cow health: " + userCommons.getCowHealth() + ", new cow health: " + newCowHealth);
                userCommons.setCowHealth(newCowHealth);
                userCommonsRepository.save(userCommons);
            }
        }

        ctx.log("Cow health has been updated!");
    }

    // exposed for testing
    public static double calculateNewCowHealthUsingStrategy(
            CowHealthUpdateStrategy strategy,
            Commons commons,
            UserCommons userCommons,
            int totalCows
    ) {
        var health = strategy.calculateNewCowHealth(commons, userCommons, totalCows);
        return Math.max(0, Math.min(health, 100));
    }
}
