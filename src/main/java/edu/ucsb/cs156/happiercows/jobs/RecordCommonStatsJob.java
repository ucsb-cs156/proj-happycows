package edu.ucsb.cs156.happiercows.jobs;

import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.CommonStats;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.services.CommonStatsService;
import edu.ucsb.cs156.jobs.services.JobContext;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;
import lombok.AllArgsConstructor;
import lombok.Getter;


/** This job computes the stats for all games in progress and creates one new row in the CommonStats table for each game.   It uses the Average Cow Health Service to compute the cowhealth for each game.
*/

@AllArgsConstructor
public class RecordCommonStatsJob implements JobContextConsumer {

    @Getter
    private CommonStatsService commonStatsService;

    @Getter
    private GameRepository gameRepository;

    @Override
    public void accept(JobContext ctx) throws Exception {
        ctx.log("Starting record common stats job...");
        Iterable<Game> allGame = gameRepository.findAll();

        for (Game game : allGame) {
            if (!GameGate.shouldProcess(game, gameRepository, ctx)) {
                continue;
            }
            ctx.log(String.format("Starting Game id=%d (%s)...", game.getId(), game.getName()));
            CommonStats commonStats = commonStatsService.createAndSaveCommonStats(game.getId());
            ctx.log(String.format("CommonStats %d for game id=%d (%s) finished.", commonStats.getId(), game.getId(),
                    game.getName()));
        }
        ctx.log("Record common stats job done!");
    }
}

