package edu.ucsb.cs156.happiercows.jobs;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import edu.ucsb.cs156.happiercows.JobTestCase;
import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.jobs.entities.Job;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.jobs.services.JobContext;

@ExtendWith(SpringExtension.class)
@ContextConfiguration
public class CommonsGateTests extends JobTestCase {

    @Mock
    CommonsRepository commonsRepository;

    private Commons commonsWithDates(LocalDateTime startingDate, LocalDateTime lastDate, boolean hidden) {
        return Commons.builder()
                .id(42L)
                .name("CS156")
                .startingDate(startingDate)
                .lastDate(lastDate)
                .hidden(hidden)
                .build();
    }

    @Test
    void gate_can_be_instantiated() {
        assertNotNull(new CommonsGate());
    }

    @Test
    void shouldProcess_returns_true_and_logs_nothing_when_game_in_progress() {
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        Commons commons = commonsWithDates(
                LocalDateTime.now().minusDays(5), LocalDateTime.now().plusDays(5), false);

        assertTrue(CommonsGate.shouldProcess(commons, commonsRepository, ctx));

        assertEquals(null, jobStarted.getLog());
        verify(commonsRepository, never()).save(any());
        assertFalse(commons.isHidden());
    }

    @Test
    void shouldProcess_returns_false_and_does_not_hide_when_game_not_yet_started() {
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        Commons commons = commonsWithDates(
                LocalDateTime.now().plusDays(5), LocalDateTime.now().plusDays(10), false);

        assertFalse(CommonsGate.shouldProcess(commons, commonsRepository, ctx));

        String expected = """
                Skipping Commons id=42 (CS156) because the game is not in progress""";
        assertEquals(expected, jobStarted.getLog());
        verify(commonsRepository, never()).save(any());
        assertFalse(commons.isHidden());
    }

    @Test
    void shouldProcess_returns_false_and_hides_commons_when_game_has_ended() {
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        Commons commons = commonsWithDates(
                LocalDateTime.now().minusDays(10), LocalDateTime.now().minusDays(5), false);

        assertFalse(CommonsGate.shouldProcess(commons, commonsRepository, ctx));

        String expected = """
                Skipping Commons id=42 (CS156) because the game is not in progress
                Commons id=42 (CS156) has ended; setting hidden to true""";
        assertEquals(expected, jobStarted.getLog());
        assertTrue(commons.isHidden());
        verify(commonsRepository).save(commons);
    }

    @Test
    void shouldProcess_does_not_save_again_when_ended_commons_is_already_hidden() {
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        Commons commons = commonsWithDates(
                LocalDateTime.now().minusDays(10), LocalDateTime.now().minusDays(5), true);

        assertFalse(CommonsGate.shouldProcess(commons, commonsRepository, ctx));

        String expected = """
                Skipping Commons id=42 (CS156) because the game is not in progress""";
        assertEquals(expected, jobStarted.getLog());
        verify(commonsRepository, never()).save(any());
    }
}
