package edu.ucsb.cs156.happiercows.jobs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.ucsb.cs156.jobs.entities.Job;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.services.CommonsPlusBuilderService;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UpdateCowHealthJobFactoryInd  {

    @Autowired 
    private CommonsRepository commonsRepository;
  
    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommonsPlusBuilderService commonsPlusBuilderService;

    public JobContextConsumer create(Long commonsID) {
        log.info("commonsRepository = " + commonsRepository);
        log.info("farmerRepository = " + farmerRepository);
        return new UpdateCowHealthJobInd(commonsRepository, farmerRepository, userRepository, commonsPlusBuilderService, commonsID);
    }
}
