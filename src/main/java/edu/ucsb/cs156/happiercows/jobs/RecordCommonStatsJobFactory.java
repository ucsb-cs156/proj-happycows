package edu.ucsb.cs156.happiercows.jobs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.services.CommonStatsService;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;

@Service
public class RecordCommonStatsJobFactory {
    
    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private CommonStatsService commonStatsService;

    public JobContextConsumer create() {
        return new RecordCommonStatsJob(
            commonStatsService,
            gameRepository);
    }
    
}
