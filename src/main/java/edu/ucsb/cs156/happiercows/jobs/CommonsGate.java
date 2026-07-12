package edu.ucsb.cs156.happiercows.jobs;

import java.time.LocalDateTime;

import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.services.jobs.JobContext;

/**
 * A shared gate used by every job (scheduled or on demand) that operates on a
 * commons: jobs should only touch games that are in progress (see
 * {@link Commons#gameInProgress(LocalDateTime)}).
 *
 * As a side effect, when a commons whose end date has passed is encountered,
 * it is automatically hidden (see issue #250).
 */
public class CommonsGate {

    /**
     * Determine whether a job should process the given commons.
     *
     * If the game is not in progress, a skip message is logged; additionally,
     * if the game has ended and the commons is not yet hidden, it is hidden
     * and saved.
     *
     * @param commons the commons the job wants to process
     * @param commonsRepository repository used to save the commons when it is auto-hidden
     * @param ctx the job context, for logging
     * @return true if the game is in progress and the job should proceed
     */
    public static boolean shouldProcess(Commons commons, CommonsRepository commonsRepository, JobContext ctx) {
        LocalDateTime now = LocalDateTime.now();
        if (commons.gameInProgress(now)) {
            return true;
        }
        ctx.log(String.format("Skipping Commons id=%d (%s) because the game is not in progress",
                commons.getId(), commons.getName()));
        if (commons.endDateHasPassed(now) && !commons.isHidden()) {
            commons.setHidden(true);
            commonsRepository.save(commons);
            ctx.log(String.format("Commons id=%d (%s) has ended; setting hidden to true",
                    commons.getId(), commons.getName()));
        }
        return false;
    }
}
