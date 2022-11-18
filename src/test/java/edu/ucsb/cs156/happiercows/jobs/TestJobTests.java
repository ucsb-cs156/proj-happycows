package edu.ucsb.cs156.happiercows.jobs;

import static org.junit.jupiter.api.Assertions.assertEquals;

import edu.ucsb.cs156.happiercows.entities.jobs.Job;
import edu.ucsb.cs156.happiercows.services.jobs.JobContext;
import lombok.extern.slf4j.Slf4j;

import org.junit.jupiter.api.Test;

@Slf4j
public class TestJobTests {

    @Test
    void test_log_output() throws Exception {

        // Arrange

        Job jobStarted = Job.builder().build();

        JobContext ctx = new JobContext(null, jobStarted);

        // Act
        TestJob testJob = TestJob.builder()
                .sleepMs(0)
                .fail(false)
                .build();
        testJob.accept(ctx);

        // Assert
        assertEquals("Hello World! from test job!\nGoodbye from test job!", jobStarted.getLog());

    }

}