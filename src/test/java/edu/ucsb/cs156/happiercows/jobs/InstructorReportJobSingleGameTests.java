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
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.Report;
import edu.ucsb.cs156.jobs.entities.Job;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.services.ReportService;
import edu.ucsb.cs156.jobs.services.JobContext;

@ExtendWith(SpringExtension.class)
@ContextConfiguration
public class InstructorReportJobSingleGameTests extends JobTestCase {

    @MockBean
    ReportService reportService;

    @MockBean
    GameRepository gameRepository;

    @Test
    void test_log_output() throws Exception {

        // Arrange

        Game game = Game.builder().id(17L).name("CS156")
                .startingDate(LocalDateTime.now().minusDays(5))
                .lastDate(LocalDateTime.now().plusDays(5))
                .build();
        Report report = Report.builder().id(17L).name("Foo").build();

        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        when(gameRepository.findById(17L)).thenReturn(Optional.of(game));
        when(reportService.createReport(17L)).thenReturn(report);

        // Act
        InstructorReportJobSingleGame InstructorReportJobSingleGame = new InstructorReportJobSingleGame(17L, reportService, gameRepository);
        InstructorReportJobSingleGame.accept(ctx);

        // Assert

        verify(reportService).createReport(17L);

        String expected = """
            Producing instructor report for game id: 17
            Instructor report 17 for game Foo has been produced!""";

        assertEquals(expected, jobStarted.getLog());
    }

    @Test
    void test_log_output_when_no_game_found() throws Exception {

        // Arrange
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        when(gameRepository.findById(17L)).thenReturn(Optional.empty());

        // Act
        InstructorReportJobSingleGame instructorReportJobSingleGame = new InstructorReportJobSingleGame(17L, reportService, gameRepository);
        instructorReportJobSingleGame.accept(ctx);

        // Assert
        verify(reportService, never()).createReport(anyLong());

        String expected = """
            Producing instructor report for game id: 17
            No game found for id 17""";

        assertEquals(expected, jobStarted.getLog());
    }

    @Test
    void test_skips_game_when_game_not_in_progress() throws Exception {

        // Arrange
        Game game = Game.builder().id(17L).name("CS156")
                .startingDate(LocalDateTime.now().plusDays(5))
                .lastDate(LocalDateTime.now().plusDays(10))
                .build();

        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        when(gameRepository.findById(17L)).thenReturn(Optional.of(game));

        // Act
        InstructorReportJobSingleGame instructorReportJobSingleGame = new InstructorReportJobSingleGame(17L, reportService, gameRepository);
        instructorReportJobSingleGame.accept(ctx);

        // Assert
        verify(reportService, never()).createReport(anyLong());

        String expected = """
            Producing instructor report for game id: 17
            Skipping Game id=17 (CS156) because the game is not in progress""";

        assertEquals(expected, jobStarted.getLog());
    }
}
