package edu.ucsb.cs156.happiercows.jobs;

import static org.junit.jupiter.api.Assertions.assertEquals;

import edu.ucsb.cs156.happiercows.entities.jobs.Job;
import edu.ucsb.cs156.happiercows.services.jobs.JobContext;
import lombok.extern.slf4j.Slf4j;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@Slf4j
@ExtendWith(SpringExtension.class)
@ContextConfiguration 
public class InstructorReportJobTests {

    @Test
    void test_log_output_with_no_user() throws Exception {

        // Arrange

        Job jobStarted = Job.builder().build();

        JobContext ctx = new JobContext(null, jobStarted);

        // Act
        InstructorReport instructorReport = InstructorReport.builder().build();
        instructorReport.accept(ctx);

        String expected = "Generating instructor report...\nThis is where the code to produce instructor report will go.\nInstructor report has been produced!";
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
        InstructorReport instructorReport = InstructorReport.builder().build();
        instructorReport.accept(ctx);

        String expected = "Generating instructor report...\nThis is where the code to produce instructor report will go.\nInstructor report has been produced!";
        // Assert
        assertEquals(expected, jobStarted.getLog());
    }
}