package edu.ucsb.cs156.happiercows.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.GameStats;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.GameStatsRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;

@Service("GameStatsService")
public class GameStatsService {

    @Autowired
    GameStatsRepository gameStatsRepository;

    @Autowired
    GameRepository gameRepository;

    @Autowired
    FarmerRepository farmerRepository;

    @Autowired
    private AverageCowHealthService averageCowHealthService;

    public GameStats createGameStats(Long gameId) {

        Game game = gameRepository.findById(gameId)
            .orElseThrow(() -> new IllegalArgumentException(String.format("Game with id %d not found", gameId)));

        double avgHealth = averageCowHealthService.getAverageCowHealth(gameId);
        int totalNumCows = averageCowHealthService.getTotalNumCows(gameId);
        int numUsers = gameRepository.getNumUsers(gameId).orElse(0);
        int effectiveCapacity = Math.max(game.getCapacityPerUser() * numUsers, game.getCarryingCapacity());

        GameStats stats = GameStats.builder()
                .gameId(gameId)
                .numCows(totalNumCows)
                .avgHealth(avgHealth)
                .effectiveCapacity(effectiveCapacity)
                .build();

        return stats;
    }

    public GameStats createAndSaveGameStats(Long gameId) {
        
        GameStats stats = createGameStats(gameId);
        gameStatsRepository.save(stats);

        return stats;
    }

}
