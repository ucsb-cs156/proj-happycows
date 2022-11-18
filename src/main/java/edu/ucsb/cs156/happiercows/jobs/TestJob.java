package edu.ucsb.cs156.happiercows.jobs;

import edu.ucsb.cs156.happiercows.services.jobs.JobContext;
import edu.ucsb.cs156.happiercows.services.jobs.JobContextConsumer;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Builder
public class TestJob implements JobContextConsumer {

    private boolean fail;
    private int sleepMs;
    
    @Override
    public void accept(JobContext ctx) throws Exception {
            ctx.log("Hello World! from test job!");
            Thread.sleep(sleepMs);
            if (fail) {
                throw new Exception("Fail!");
            }
            ctx.log("Goodbye from test job!");
    }
}
