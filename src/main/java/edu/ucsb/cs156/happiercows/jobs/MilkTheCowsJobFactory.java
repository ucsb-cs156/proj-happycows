package edu.ucsb.cs156.happiercows.jobs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.ProfitRepository;
import edu.ucsb.cs156.happiercows.repositories.UserCommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MilkTheCowsJobFactory {

    @Autowired
    private CommonsRepository commonsRepository;

    @Autowired
    private UserCommonsRepository userCommonsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfitRepository profitRepository;

    public MilkTheCowsJob create() {
        return new MilkTheCowsJob(
                commonsRepository,
                userCommonsRepository,
                userRepository,
                profitRepository);
    }
}
