package edu.ucsb.cs156.happiercows.jobs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.ProfitRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;

@Service
public class MilkTheCowsJobFactoryInd {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfitRepository profitRepository;


    public JobContextConsumer create(Long gameID) {
        return new MilkTheCowsJobInd(
                gameRepository,
                farmerRepository,
                userRepository,
                profitRepository,
                gameID);
    }
}
