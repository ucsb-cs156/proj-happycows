package edu.ucsb.cs156.happiercows.jobs;

import java.time.LocalDateTime;

import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.jobs.services.JobContext;

/**
 * A shared gate used by every job (scheduled or on demand) that operates on a
 * game: jobs should only touch games that are in progress (see
 * {@link Game#gameInProgress(LocalDateTime)}).
 *
 * As a side effect, when a game whose end date has passed is encountered,
 * it is automatically hidden (see issue #250).
 */
public class GameGate {

    /**
     * Determine whether a job should process the given game.
     *
     * If the game is not in progress, a skip message is logged; additionally,
     * if the game has ended and the game is not yet hidden, it is hidden
     * and saved.
     *
     * @param game the game the job wants to process
     * @param gameRepository repository used to save the game when it is auto-hidden
     * @param ctx the job context, for logging
     * @return true if the game is in progress and the job should proceed
     */
    public static boolean shouldProcess(Game game, GameRepository gameRepository, JobContext ctx) {
        LocalDateTime now = LocalDateTime.now();
        if (game.gameInProgress(now)) {
            return true;
        }
        ctx.log(String.format("Skipping Game id=%d (%s) because the game is not in progress",
                game.getId(), game.getName()));
        if (game.endDateHasPassed(now) && !game.isHidden()) {
            game.setHidden(true);
            gameRepository.save(game);
            ctx.log(String.format("Game id=%d (%s) has ended; setting hidden to true",
                    game.getId(), game.getName()));
        }
        return false;
    }
}
