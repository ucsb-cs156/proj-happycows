package edu.ucsb.cs156.happiercows.jobs;

import edu.ucsb.cs156.happiercows.services.jobs.JobContext;
import edu.ucsb.cs156.happiercows.services.jobs.JobContextConsumer;

public class UpdateCowHealthJob implements JobContextConsumer {
    @Override
    public void accept(JobContext ctx) throws Exception {
        ctx.log("Starting to Update Cow Health");
    }
}
