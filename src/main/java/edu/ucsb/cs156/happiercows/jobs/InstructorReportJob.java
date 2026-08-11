package edu.ucsb.cs156.happiercows.jobs;

import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.Report;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.jobs.services.JobContext;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;
import edu.ucsb.cs156.happiercows.services.ReportService;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
public class InstructorReportJob implements JobContextConsumer {

    @Getter
    private ReportService reportService;

    @Getter
    private GameRepository gameRepository;

    @Override
    public void accept(JobContext ctx) throws Exception {
        ctx.log("Starting instructor report...");
        Iterable<Game> allGame = gameRepository.findAll();

        for (Game game : allGame) {
            if (!GameGate.shouldProcess(game, gameRepository, ctx)) {
                continue;
            }
            ctx.log(String.format("Starting Game id=%d (%s)...", game.getId(), game.getName()));
            Report report = reportService.createReport(game.getId());
            ctx.log(String.format("Report %d for game id=%d (%s) finished.", report.getId(), game.getId(),
                    game.getName()));
        }
        ctx.log("Instructor report done!");
    }
}