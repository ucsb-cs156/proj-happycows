package edu.ucsb.cs156.happiercows.jobs;

import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.UserCommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.services.jobs.JobContextConsumer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SetCowHealthJobFactory {

  @Autowired private CommonsRepository commonsRepository;

  @Autowired private UserCommonsRepository userCommonsRepository;

  @Autowired private UserRepository userRepository;

  public JobContextConsumer create(Long commonsID, double health) {
    log.info("commonsRepository = " + commonsRepository);
    log.info("userCommonsRepository = " + userCommonsRepository);
    return new SetCowHealthJob(
        commonsID, health, commonsRepository, userCommonsRepository, userRepository);
  }
}
