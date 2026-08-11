package edu.ucsb.cs156.happiercows.jobs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SetCowHealthJobFactory  {

    @Autowired 
    private GameRepository gameRepository;
  
    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private UserRepository userRepository;

    public JobContextConsumer create(Long gameID, double health) {
        log.info("gameRepository = " + gameRepository);
        log.info("farmerRepository = " + farmerRepository);
        return new SetCowHealthJob(gameID, health, gameRepository, farmerRepository, userRepository);
    }
}
