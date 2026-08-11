package edu.ucsb.cs156.happiercows.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.Report;
import edu.ucsb.cs156.happiercows.entities.ReportLine;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.ReportLineRepository;
import edu.ucsb.cs156.happiercows.repositories.ReportRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;

@Service("ReportService")
public class ReportService {

    @Autowired
    ReportRepository reportRepository;

    @Autowired
    ReportLineRepository reportLineRepository;

    @Autowired
    GameRepository gameRepository;

    @Autowired
    FarmerRepository farmerRepository;

    public Report createReport(Long gameId) {
        Report report = createAndSaveReportHeader(gameId);
        
        Iterable<Farmer> allFarmer = farmerRepository.findByGameId(gameId);


        for (Farmer farmer : allFarmer) {
               createAndSaveReportLine(report, farmer);
        }

        return report;
    }

    public Report createAndSaveReportHeader(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException(String.format("Game with id %d not found", gameId)));

        Report report = Report.builder()
                .gameId(gameId)

                .name(game.getName())
                .cowPrice(game.getCowPrice())
                .milkPrice(game.getMilkPrice())
                .startingBalance(game.getStartingBalance())
                .startingDate(game.getStartingDate())
                .showLeaderboard(game.isShowLeaderboard())
                .carryingCapacity(game.getCarryingCapacity())
                .degradationRate(game.getDegradationRate())
                .belowCapacityHealthUpdateStrategy(game.getBelowCapacityHealthUpdateStrategy())
                .aboveCapacityHealthUpdateStrategy(game.getAboveCapacityHealthUpdateStrategy())
                .numUsers(gameRepository.getNumUsers(gameId).orElse(0))
                .numCows(gameRepository.getNumCows(gameId).orElse(0))

                .build();

        reportRepository.save(report);
        return report;
    }

    public ReportLine createAndSaveReportLine(Report report, Farmer farmer) {
        ReportLine reportLine = ReportLine.builder()
                .reportId(report.getId())
                .userId(farmer.getUser().getId())
                .username(farmer.getUsername())
                .totalWealth(farmer.getTotalWealth())
                .numOfCows(farmer.getNumOfCows())
                .avgCowHealth(farmer.getCowHealth())
                .cowsBought(farmer.getCowsBought())
                .cowsSold(farmer.getCowsSold())
                .cowDeaths(farmer.getCowDeaths())
                .build();

        reportLineRepository.save(reportLine);
        return reportLine;
    }

}
