package edu.ucsb.cs156.happiercows.jobs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.services.GameStatsService;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;

@Service
public class RecordGameStatsJobFactory {
    
    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private GameStatsService gameStatsService;

    public JobContextConsumer create() {
        return new RecordGameStatsJob(
            gameStatsService,
            gameRepository);
    }
    
}
