package edu.ucsb.cs156.happiercows.jobs;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import edu.ucsb.cs156.happiercows.entities.jobs.Job;
import edu.ucsb.cs156.happiercows.services.jobs.JobContext;

public class InstructorReportJobTests {
    @Test
    void test_log_output() throws Exception {

        // Arrange

        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        // Act
        InstructorReportJob instructorReportJob = InstructorReportJob.builder()
                .build();
        instructorReportJob.accept(ctx);

        // Assert

        String expected = "Starting instructor report\n" +
                "This is where the code for the instructor report will go\n" +
                "Instructor report job completed";

        assertEquals(expected, jobStarted.getLog());

    }
}