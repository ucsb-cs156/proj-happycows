package edu.ucsb.cs156.happiercows.jobs;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.JobTestCase;
import edu.ucsb.cs156.happiercows.entities.GameStats;
import edu.ucsb.cs156.jobs.entities.Job;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.services.AverageCowHealthService;
import edu.ucsb.cs156.happiercows.services.GameStatsService;
import edu.ucsb.cs156.jobs.services.JobContext;

@ExtendWith(SpringExtension.class)
@ContextConfiguration
public class RecordGameStatsJobTests extends JobTestCase {

    @MockBean
    AverageCowHealthService averageCowHealthService;

    @MockBean
    GameStatsService gameStatsService;

    @MockBean
    GameRepository gameRepository;

    @Test
    void test_log_output() throws Exception {

        // Arrange

        Game game= Game.builder().id(17L).name("CS156")
                .startingDate(LocalDateTime.now().minusDays(5))
                .lastDate(LocalDateTime.now().plusDays(5))
                .build();
        GameStats gameStats = GameStats.builder().id(17L).build();
        
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);
      
        when(gameRepository.findAll()).thenReturn(Arrays.asList(game));      
        when(gameStatsService.createAndSaveGameStats(17L)).thenReturn(gameStats);

        // Act
        RecordGameStatsJob recordGameStatsJob = 
                new RecordGameStatsJob(gameStatsService, gameRepository);
        recordGameStatsJob.accept(ctx);

        // Assert

        verify(gameRepository).findAll();
        verify(gameStatsService).createAndSaveGameStats(17L);
        
        String expected = """
            Starting record game stats job...
            Starting Game id=17 (CS156)...
            GameStats 17 for game id=17 (CS156) finished.
            Record game stats job done!""";
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

        when(gameRepository.findAll()).thenReturn(Arrays.asList(game));

        // Act
        RecordGameStatsJob recordGameStatsJob =
                new RecordGameStatsJob(gameStatsService, gameRepository);
        recordGameStatsJob.accept(ctx);

        // Assert
        verify(gameStatsService, never()).createAndSaveGameStats(anyLong());

        String expected = """
            Starting record game stats job...
            Skipping Game id=17 (CS156) because the game is not in progress
            Record game stats job done!""";
        assertEquals(expected, jobStarted.getLog());
    }

    @Test
    void test_no_game() throws Exception {

        // Arrange
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);
        when(gameRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        RecordGameStatsJob recordGameStatsJob = 
                new RecordGameStatsJob(gameStatsService, gameRepository);
        recordGameStatsJob.accept(ctx);

        // Assert

        verify(gameRepository).findAll();
        
        String expected = """
            Starting record game stats job...
            Record game stats job done!""";
        assertEquals(expected, jobStarted.getLog());
    }
    
}
