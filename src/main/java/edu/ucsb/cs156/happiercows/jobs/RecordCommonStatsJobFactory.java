package edu.ucsb.cs156.happiercows.jobs;

import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.services.CommonStatsService;
import edu.ucsb.cs156.happiercows.services.jobs.JobContextConsumer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RecordCommonStatsJobFactory {

  @Autowired private CommonsRepository commonsRepository;

  @Autowired private CommonStatsService commonStatsService;

  public JobContextConsumer create() {
    return new RecordCommonStatsJob(commonStatsService, commonsRepository);
  }
}
