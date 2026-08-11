package edu.ucsb.cs156.happiercows.jobs;


import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.ProfitRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.jobs.services.JobContext;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.Optional;

@AllArgsConstructor
public class MilkTheCowsJobInd implements JobContextConsumer {

    @Getter
    private GameRepository gameRepository;
    @Getter
    private FarmerRepository farmerRepository;
    @Getter
    private UserRepository userRepository;
    @Getter
    private ProfitRepository profitRepository;
    @Getter
    private long gameID;

    public String formatDollars(double amount) {
        return  String.format("$%.2f", amount);
    }

    @Override
    public void accept(JobContext ctx) throws Exception {
        ctx.log("Starting to milk the cows");
        Optional<Game> commonMilkedOpt = gameRepository.findById(gameID);

        if(commonMilkedOpt.isPresent()){
            Game commonMilked = commonMilkedOpt.get();
            if (!GameGate.shouldProcess(commonMilked, gameRepository, ctx)) {
                return;
            }
            String name = commonMilked.getName();
            double milkPrice = commonMilked.getMilkPrice();
            ctx.log("Milking cows for Game: " + name + ", Milk Price: " + formatDollars(milkPrice));

            Iterable<Farmer> allFarmer = farmerRepository.findByGameId(commonMilked.getId());

            for (Farmer farmer : allFarmer) {
                MilkTheCowsJob.milkCows(ctx, commonMilked, farmer, profitRepository, farmerRepository);
            }
            

            ctx.log("Cows have been milked!");
        } else {
            ctx.log(String.format("No game found for id %d", gameID));
        }
    }

}
