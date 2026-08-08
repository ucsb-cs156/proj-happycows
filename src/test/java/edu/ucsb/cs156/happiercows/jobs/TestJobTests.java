package edu.ucsb.cs156.happiercows.jobs;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import edu.ucsb.cs156.happiercows.JobTestCase;
import edu.ucsb.cs156.jobs.entities.Job;
import edu.ucsb.cs156.jobs.services.JobContext;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@ContextConfiguration 
public class TestJobTests extends JobTestCase {

    @Test
    void test_log_output_with_no_user() throws Exception {

        // Arrange

        Job jobStarted = Job.builder().build();

        JobContext ctx = new JobContext(null, jobStarted);

        // Act
        TestJob testJob = TestJob.builder()
                .sleepMs(0)
                .fail(false)
                .build();
        testJob.accept(ctx);

        String expected = """
            Hello World! from test job!
            authentication is null
            Goodbye from test job!""";
        // Assert
        assertEquals(expected, jobStarted.getLog());
    }

    @Test
    @WithMockUser(roles = { "ADMIN" })
    void test_log_output_with_mock_user() throws Exception {
        // Arrange

        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        // Act
        TestJob testJob = TestJob.builder()
                .sleepMs(0)
                .fail(false)
                .build();
        testJob.accept(ctx);

        String expected = """
                Hello World! from test job!
                authentication is not null
                Goodbye from test job!""";
        // Assert
        assertEquals(expected, jobStarted.getLog());
    }

    @Test
    void test_throws_and_skips_goodbye_when_fail_is_true() {
        // Arrange

        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        // Act
        TestJob testJob = TestJob.builder()
                .sleepMs(0)
                .fail(true)
                .build();

        Exception thrown = assertThrows(Exception.class, () -> testJob.accept(ctx));

        // Assert
        assertEquals("Fail!", thrown.getMessage());
        String expected = """
                Hello World! from test job!
                authentication is null""";
        assertEquals(expected, jobStarted.getLog());
    }

    @Test
    void test_sleeps_for_the_configured_duration() throws Exception {
        // Arrange

        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        TestJob testJob = TestJob.builder()
                .sleepMs(50)
                .fail(false)
                .build();

        // Act
        long start = System.nanoTime();
        testJob.accept(ctx);
        long elapsedMs = (System.nanoTime() - start) / 1_000_000;

        // Assert
        assertTrue(elapsedMs >= 45, "slept only " + elapsedMs + " ms");
    }
}