package edu.ucsb.cs156.happiercows.jobs;

import java.util.Optional;

import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.GamePlus;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.services.GamePlusBuilderService;
import edu.ucsb.cs156.jobs.services.JobContext;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
public class UpdateCowHealthJobInd implements JobContextConsumer {

    @Getter
    private GameRepository gameRepository;
    @Getter
    private FarmerRepository farmerRepository;
    @Getter
    private UserRepository userRepository;
    @Getter
    private GamePlusBuilderService gamePlusBuilderService;
    @Getter
    private Long gameID;

    @Override
    public void accept(JobContext ctx) throws Exception {
        ctx.log("Updating cow health...");

       Optional<Game> commonUpdatedOpt = gameRepository.findById(gameID);


        if(commonUpdatedOpt.isPresent()){
            Game gameUpdated = commonUpdatedOpt.get();
            if (!GameGate.shouldProcess(gameUpdated, gameRepository, ctx)) {
                return;
            }
            GamePlus gamePlus = gamePlusBuilderService.toGamePlus(gameUpdated);
            UpdateCowHealthJob.runUpdateJobInGame(gameUpdated, gamePlus, gamePlusBuilderService, gameRepository, farmerRepository, ctx); 
            ctx.log("Cow health has been updated!");
        } else {
            ctx.log(String.format("No game found for id %d", gameID));
        }
    }
    
}
