package edu.ucsb.cs156.happiercows.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.ucsb.cs156.happiercows.entities.CommonStats;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.CommonStatsRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;

@Service("CommonStatsService")
public class CommonStatsService {

    @Autowired
    CommonStatsRepository commonStatsRepository;

    @Autowired
    GameRepository gameRepository;

    @Autowired
    FarmerRepository farmerRepository;

    @Autowired
    private AverageCowHealthService averageCowHealthService;

    public CommonStats createCommonStats(Long gameId) {

        gameRepository.findById(gameId)
            .orElseThrow(() -> new IllegalArgumentException(String.format("Game with id %d not found", gameId)));
        
        double avgHealth = averageCowHealthService.getAverageCowHealth(gameId);
        int totalNumCows = averageCowHealthService.getTotalNumCows(gameId);

        CommonStats stats = CommonStats.builder()
                .gameId(gameId)
                .numCows(totalNumCows)
                .avgHealth(avgHealth)
                .build();

        return stats;
    }

    public CommonStats createAndSaveCommonStats(Long gameId) {
        
        CommonStats stats = createCommonStats(gameId);
        commonStatsRepository.save(stats);

        return stats;
    }

}
