package edu.ucsb.cs156.happiercows.jobs;

import edu.ucsb.cs156.happiercows.services.jobs.JobContext;
import edu.ucsb.cs156.happiercows.services.jobs.JobContextConsumer;
import lombok.Builder;

@Builder
public class UpdateCowHealth implements JobContextConsumer {

    @Override
    public void accept(JobContext ctx) throws Exception {
        ctx.log("Updating cow health...");
        ctx.log("This is where the code to update cow health will go.");
        ctx.log("Cow health has been updated!");
    }
}
