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
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.utilities.PacificTimeUtils;
import edu.ucsb.cs156.jobs.entities.Job;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.jobs.services.JobContext;

@ExtendWith(SpringExtension.class)
@ContextConfiguration
public class GameGateTests extends JobTestCase {

    @Mock
    GameRepository gameRepository;

    private Game gameWithDates(LocalDateTime startingDate, LocalDateTime lastDate, boolean hidden) {
        return Game.builder()
                .id(42L)
                .name("CS156")
                .startingDate(startingDate)
                .lastDate(lastDate)
                .hidden(hidden)
                .build();
    }

    @Test
    void gate_can_be_instantiated() {
        assertNotNull(new GameGate());
    }

    @Test
    void shouldProcess_returns_true_and_logs_nothing_when_game_in_progress() {
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        Game game = gameWithDates(
                LocalDateTime.now().minusDays(5), LocalDateTime.now().plusDays(5), false);

        assertTrue(GameGate.shouldProcess(game, gameRepository, ctx));

        assertEquals(null, jobStarted.getLog());
        verify(gameRepository, never()).save(any());
        assertFalse(game.isHidden());
    }

    @Test
    void shouldProcess_returns_false_and_does_not_hide_when_game_not_yet_started() {
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        Game game = gameWithDates(
                LocalDateTime.now().plusDays(5), LocalDateTime.now().plusDays(10), false);

        assertFalse(GameGate.shouldProcess(game, gameRepository, ctx));

        String expected = """
                Skipping Game id=42 (CS156) because the game is not in progress""";
        assertEquals(expected, jobStarted.getLog());
        verify(gameRepository, never()).save(any());
        assertFalse(game.isHidden());
    }

    @Test
    void shouldProcess_returns_false_and_hides_game_when_game_has_ended() {
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        Game game = gameWithDates(
                LocalDateTime.now().minusDays(10), LocalDateTime.now().minusDays(5), false);

        assertFalse(GameGate.shouldProcess(game, gameRepository, ctx));

        String expected = """
                Skipping Game id=42 (CS156) because the game is not in progress
                Game id=42 (CS156) has ended; setting hidden to true""";
        assertEquals(expected, jobStarted.getLog());
        assertTrue(game.isHidden());
        verify(gameRepository).save(game);
    }

    @Test
    void shouldProcess_does_not_save_again_when_ended_game_is_already_hidden() {
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        Game game = gameWithDates(
                LocalDateTime.now().minusDays(10), LocalDateTime.now().minusDays(5), true);

        assertFalse(GameGate.shouldProcess(game, gameRepository, ctx));

        String expected = """
                Skipping Game id=42 (CS156) because the game is not in progress""";
        assertEquals(expected, jobStarted.getLog());
        verify(gameRepository, never()).save(any());
    }

    @Test
    void shouldProcess_with_explicit_now_evaluates_the_game_as_of_that_instant() {
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        Game game = gameWithDates(
                LocalDateTime.now().minusDays(5), LocalDateTime.now().plusDays(5), false);

        // A now more than 5 days in the future than the game's own dates
        // computed above means the game should be treated as having ended,
        // regardless of what LocalDateTime.now() would report at test-run
        // time - proving `now` is honored rather than recomputed internally.
        LocalDateTime farFuture = LocalDateTime.now().plusDays(20);

        assertFalse(GameGate.shouldProcess(game, gameRepository, ctx, farFuture));

        String expected = """
                Skipping Game id=42 (CS156) because the game is not in progress
                Game id=42 (CS156) has ended; setting hidden to true""";
        assertEquals(expected, jobStarted.getLog());
        assertTrue(game.isHidden());
        verify(gameRepository).save(game);
    }

    @Test
    void shouldProcess_convenience_overload_delegates_to_pacific_now() {
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        // Computed using Pacific time specifically (issue #318): if the
        // convenience overload used the JVM's own default timezone instead,
        // this game (whose dates are also Pacific-anchored) would still
        // register as in progress here since the margin is wide, but the
        // point of this test is to exercise the actual production code path
        // (the no-`now`-argument overload) end to end at least once.
        LocalDateTime pacificNow = LocalDateTime.now(PacificTimeUtils.ZONE);
        Game game = gameWithDates(pacificNow.minusDays(5), pacificNow.plusDays(5), false);

        assertTrue(GameGate.shouldProcess(game, gameRepository, ctx));
    }
}
