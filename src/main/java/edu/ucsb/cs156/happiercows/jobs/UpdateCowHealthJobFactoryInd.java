package edu.ucsb.cs156.happiercows.jobs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.ucsb.cs156.jobs.entities.Job;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.services.GamePlusBuilderService;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UpdateCowHealthJobFactoryInd  {

    @Autowired 
    private GameRepository gameRepository;
  
    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GamePlusBuilderService gamePlusBuilderService;

    public JobContextConsumer create(Long gameID) {
        log.info("gameRepository = " + gameRepository);
        log.info("farmerRepository = " + farmerRepository);
        return new UpdateCowHealthJobInd(gameRepository, farmerRepository, userRepository, gamePlusBuilderService, gameID);
    }
}
