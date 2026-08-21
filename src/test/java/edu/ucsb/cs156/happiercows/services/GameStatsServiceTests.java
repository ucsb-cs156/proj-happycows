package edu.ucsb.cs156.happiercows.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.GameStats;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.repositories.GameStatsRepository;
import edu.ucsb.cs156.happiercows.strategies.CowHealthUpdateStrategies;

@ExtendWith(SpringExtension.class)
@Import(GameStatsService.class)
@ContextConfiguration
public class GameStatsServiceTests {
    
    @MockBean
    UserRepository userRepository;
  
    @MockBean
    GameRepository gameRepository;
  
    @MockBean
    FarmerRepository farmerRepository;   

    @MockBean
    GameStatsRepository gameStatsRepository;    

    @MockBean
    AverageCowHealthService averageCowHealthService;

    @Autowired
    GameStatsService gameStatsService;

    private Game game = Game
        .builder()
        .id(17L)
        .name("test game")
        .cowPrice(10)
        .milkPrice(2)
        .startingBalance(300)
        .startingDate(LocalDateTime.parse("2022-03-05T15:50:10"))
        .showLeaderboard(true)
        .capacityPerUser(20)
        .carryingCapacity(100)
        .degradationRate(0.01)
        .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear)
        .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear)
        .build();

    GameStats expectedStats1 = GameStats
        .builder()
        .gameId(17L)
        .numCows(20)
        .avgHealth(10)
        .effectiveCapacity(100)
        .numFarmers(1)
        .capacityPerUser(20)
        .carryingCapacity(100)
        .build();

    GameStats expectedStats2 = GameStats
        .builder()
        .gameId(17L)
        .numCows(120)
        .avgHealth(20)
        .effectiveCapacity(200)
        .numFarmers(10)
        .capacityPerUser(20)
        .carryingCapacity(100)
        .build();


    @Test
    void test_saveStatsOneUser() {
        // arrange

        when(gameRepository.findById(17L)).thenReturn(Optional.of(game));
        when(gameRepository.getNumUsers(17L)).thenReturn(Optional.of(1));
        when(averageCowHealthService.getAverageCowHealth(17L)).thenReturn(10.0);
        when(averageCowHealthService.getTotalNumCows(17L)).thenReturn(20);

        // act

        GameStats stats = gameStatsService.createAndSaveGameStats(17L);

        // assert
        verify(gameStatsRepository).save(eq(expectedStats1));
        assertEquals(expectedStats1, stats);
    }

    @Test
    void test_saveStatsMultipleUsers() {
        // arrange

        when(gameRepository.findById(17L)).thenReturn(Optional.of(game));
        when(gameRepository.getNumUsers(17L)).thenReturn(Optional.of(10));
        when(averageCowHealthService.getAverageCowHealth(17L)).thenReturn(20.0);
        when(averageCowHealthService.getTotalNumCows(17L)).thenReturn(120);

        // act

        GameStats stats = gameStatsService.createAndSaveGameStats(17L);

        // assert
        verify(gameStatsRepository).save(eq(expectedStats2));
        assertEquals(expectedStats2, stats);
    }

    @Test
    void test_effectiveCapacity_defaults_numUsers_to_zero_when_getNumUsers_is_empty() {
        // arrange

        when(gameRepository.findById(17L)).thenReturn(Optional.of(game));
        when(gameRepository.getNumUsers(17L)).thenReturn(Optional.empty());
        when(averageCowHealthService.getAverageCowHealth(17L)).thenReturn(10.0);
        when(averageCowHealthService.getTotalNumCows(17L)).thenReturn(20);

        // act

        GameStats stats = gameStatsService.createAndSaveGameStats(17L);

        // assert: capacityPerUser * 0 = 0, so carryingCapacity (100) wins
        assertEquals(100, stats.getEffectiveCapacity());
    }

    @Test
    void test_getAverageCowHealthThrowsException() {
        when(gameRepository.findById(1L)).thenReturn(Optional.empty());

        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            gameStatsService.createAndSaveGameStats(1L);
        });
    }
}
