package edu.ucsb.cs156.happiercows.jobs;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import edu.ucsb.cs156.happiercows.JobTestCase;
import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.Report;
import edu.ucsb.cs156.happiercows.entities.jobs.Job;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.services.ReportService;
import edu.ucsb.cs156.happiercows.services.jobs.JobContext;

@ExtendWith(SpringExtension.class)
@ContextConfiguration
public class InstructorReportJobSingleCommonsTests extends JobTestCase {

    @MockBean
    ReportService reportService;

    @MockBean
    CommonsRepository commonsRepository;

    @Test
    void test_log_output() throws Exception {

        // Arrange

        Commons commons = Commons.builder().id(17L).name("CS156")
                .startingDate(LocalDateTime.now().minusDays(5))
                .lastDate(LocalDateTime.now().plusDays(5))
                .build();
        Report report = Report.builder().id(17L).name("Foo").build();

        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        when(commonsRepository.findById(17L)).thenReturn(Optional.of(commons));
        when(reportService.createReport(17L)).thenReturn(report);

        // Act
        InstructorReportJobSingleCommons InstructorReportJobSingleCommons = new InstructorReportJobSingleCommons(17L, reportService, commonsRepository);
        InstructorReportJobSingleCommons.accept(ctx);

        // Assert

        verify(reportService).createReport(17L);

        String expected = """
            Producing instructor report for commons id: 17
            Instructor report 17 for commons Foo has been produced!""";

        assertEquals(expected, jobStarted.getLog());
    }

    @Test
    void test_log_output_when_no_commons_found() throws Exception {

        // Arrange
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        when(commonsRepository.findById(17L)).thenReturn(Optional.empty());

        // Act
        InstructorReportJobSingleCommons instructorReportJobSingleCommons = new InstructorReportJobSingleCommons(17L, reportService, commonsRepository);
        instructorReportJobSingleCommons.accept(ctx);

        // Assert
        verify(reportService, never()).createReport(anyLong());

        String expected = """
            Producing instructor report for commons id: 17
            No commons found for id 17""";

        assertEquals(expected, jobStarted.getLog());
    }

    @Test
    void test_skips_commons_when_game_not_in_progress() throws Exception {

        // Arrange
        Commons commons = Commons.builder().id(17L).name("CS156")
                .startingDate(LocalDateTime.now().plusDays(5))
                .lastDate(LocalDateTime.now().plusDays(10))
                .build();

        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        when(commonsRepository.findById(17L)).thenReturn(Optional.of(commons));

        // Act
        InstructorReportJobSingleCommons instructorReportJobSingleCommons = new InstructorReportJobSingleCommons(17L, reportService, commonsRepository);
        instructorReportJobSingleCommons.accept(ctx);

        // Assert
        verify(reportService, never()).createReport(anyLong());

        String expected = """
            Producing instructor report for commons id: 17
            Skipping Commons id=17 (CS156) because the game is not in progress""";

        assertEquals(expected, jobStarted.getLog());
    }
}
