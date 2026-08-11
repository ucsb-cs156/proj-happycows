package edu.ucsb.cs156.happiercows.jobs;


import java.util.Optional;

import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.Report;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.jobs.services.JobContext;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;
import edu.ucsb.cs156.happiercows.services.ReportService;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
public class InstructorReportJobSingleGame implements JobContextConsumer {

    @Getter
    private long gameId;

    @Getter
    private ReportService reportService;

    @Getter
    private GameRepository gameRepository;

    @Override
    public void accept(JobContext ctx) throws Exception {
        ctx.log("Producing instructor report for game id: " + gameId);
        Optional<Game> gameOpt = gameRepository.findById(gameId);
        if (!gameOpt.isPresent()) {
            ctx.log(String.format("No game found for id %d", gameId));
            return;
        }
        if (!GameGate.shouldProcess(gameOpt.get(), gameRepository, ctx)) {
            return;
        }
        Report report = reportService.createReport(gameId);
        ctx.log(String.format("Instructor report %d for game %s has been produced!", report.getId(), report.getName()));
    }
}
