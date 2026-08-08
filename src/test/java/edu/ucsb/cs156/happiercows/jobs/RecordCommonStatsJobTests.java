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

import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.JobTestCase;
import edu.ucsb.cs156.happiercows.entities.CommonStats;
import edu.ucsb.cs156.jobs.entities.Job;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.services.AverageCowHealthService;
import edu.ucsb.cs156.happiercows.services.CommonStatsService;
import edu.ucsb.cs156.jobs.services.JobContext;

@ExtendWith(SpringExtension.class)
@ContextConfiguration
public class RecordCommonStatsJobTests extends JobTestCase {

    @MockBean
    AverageCowHealthService averageCowHealthService;

    @MockBean
    CommonStatsService commonStatsService;

    @MockBean
    CommonsRepository commonsRepository;

    @Test
    void test_log_output() throws Exception {

        // Arrange

        Commons commons= Commons.builder().id(17L).name("CS156")
                .startingDate(LocalDateTime.now().minusDays(5))
                .lastDate(LocalDateTime.now().plusDays(5))
                .build();
        CommonStats commonStats = CommonStats.builder().id(17L).build();
        
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);
      
        when(commonsRepository.findAll()).thenReturn(Arrays.asList(commons));      
        when(commonStatsService.createAndSaveCommonStats(17L)).thenReturn(commonStats);

        // Act
        RecordCommonStatsJob recordCommonStatsJob = 
                new RecordCommonStatsJob(commonStatsService, commonsRepository);
        recordCommonStatsJob.accept(ctx);

        // Assert

        verify(commonsRepository).findAll();
        verify(commonStatsService).createAndSaveCommonStats(17L);
        
        String expected = """
            Starting record common stats job...
            Starting Commons id=17 (CS156)...
            CommonStats 17 for commons id=17 (CS156) finished.
            Record common stats job done!""";
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

        when(commonsRepository.findAll()).thenReturn(Arrays.asList(commons));

        // Act
        RecordCommonStatsJob recordCommonStatsJob =
                new RecordCommonStatsJob(commonStatsService, commonsRepository);
        recordCommonStatsJob.accept(ctx);

        // Assert
        verify(commonStatsService, never()).createAndSaveCommonStats(anyLong());

        String expected = """
            Starting record common stats job...
            Skipping Commons id=17 (CS156) because the game is not in progress
            Record common stats job done!""";
        assertEquals(expected, jobStarted.getLog());
    }

    @Test
    void test_no_commons() throws Exception {

        // Arrange
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);
        when(commonsRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        RecordCommonStatsJob recordCommonStatsJob = 
                new RecordCommonStatsJob(commonStatsService, commonsRepository);
        recordCommonStatsJob.accept(ctx);

        // Assert

        verify(commonsRepository).findAll();
        
        String expected = """
            Starting record common stats job...
            Record common stats job done!""";
        assertEquals(expected, jobStarted.getLog());
    }
    
}
