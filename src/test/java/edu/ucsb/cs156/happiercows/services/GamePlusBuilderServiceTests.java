package edu.ucsb.cs156.happiercows.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.GamePlus;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.strategies.CowHealthUpdateStrategies;

@ExtendWith(SpringExtension.class)
@Import(GamePlusBuilderService.class)
@ContextConfiguration
public class GamePlusBuilderServiceTests {
    @MockitoBean
    UserRepository userRepository;

    @MockitoBean
    GameRepository gameRepository;

    @MockitoBean
    FarmerRepository farmerRepository;

    @MockitoBean
    AverageCowHealthService averageCowHealthService;

    @Autowired
    GamePlusBuilderService gamePlusBuilderService;

    private Game game = Game
            .builder()
            .id(17L)
            .name("test game")
            .cowPrice(10)
            .milkPrice(2)
            .startingBalance(300)
            .startingDate(LocalDateTime.parse("2022-03-05T15:50:10"))
            .showLeaderboard(true)
            .carryingCapacity(100)
            .degradationRate(0.01)
            .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear)
            .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear)
            .build();

    private GamePlus gamePlus = GamePlus
            .builder()
            .game(game)
            .totalCows(200)
            .totalUsers(5)
            .averageCowsPerFarmer(40.0)
            .medianCowsPerFarmer(30.0)
            .minimumCowsPerFarmer(10)
            .maximumCowsPerFarmer(100)
            .standardDeviationCowsPerFarmer(31.622776601683793)
            .averageCowHealth(85.5)
            .build();

    @Test
    void test_toGamePlus() {
        when(gameRepository.getNumCows(17L)).thenReturn(Optional.of(200));
        when(gameRepository.getNumUsers(17L)).thenReturn(Optional.of(5));
        when(averageCowHealthService.getAverageCowHealth(17L)).thenReturn(85.5);
        when(farmerRepository.findByGameId(17L)).thenReturn(List.of(
                Farmer.builder().numOfCows(10).build(),
                Farmer.builder().numOfCows(20).build(),
                Farmer.builder().numOfCows(30).build(),
                Farmer.builder().numOfCows(40).build(),
                Farmer.builder().numOfCows(100).build()));
        GamePlus gamePlus = gamePlusBuilderService.toGamePlus(game);
        assertEquals(gamePlus, this.gamePlus);
    }

    @Test
    void test_toGamePlus_median_when_numUsers_is_even_and_users_are_unsorted() {
        when(gameRepository.getNumCows(17L)).thenReturn(Optional.of(21));
        when(gameRepository.getNumUsers(17L)).thenReturn(Optional.of(6));
        when(farmerRepository.findByGameId(17L)).thenReturn(List.of(
                Farmer.builder().numOfCows(1).build(),
                Farmer.builder().numOfCows(4).build(),
                Farmer.builder().numOfCows(2).build(),
                Farmer.builder().numOfCows(3).build(),
                Farmer.builder().numOfCows(5).build(),
                Farmer.builder().numOfCows(6).build()));

        GamePlus gamePlus = gamePlusBuilderService.toGamePlus(game);
        assertEquals(3.5, gamePlus.getMedianCowsPerFarmer());
    }

    @Test
    void test_toGamePlus_median_when_users_are_unsorted() {
        when(gameRepository.getNumCows(17L)).thenReturn(Optional.of(21));
        when(gameRepository.getNumUsers(17L)).thenReturn(Optional.of(6));
        when(farmerRepository.findByGameId(17L)).thenReturn(List.of(
                Farmer.builder().numOfCows(3).build(),
                Farmer.builder().numOfCows(1).build(),
                Farmer.builder().numOfCows(5).build(),
                Farmer.builder().numOfCows(2).build(),
                Farmer.builder().numOfCows(4).build(),
                Farmer.builder().numOfCows(6).build()));

        GamePlus gamePlus = gamePlusBuilderService.toGamePlus(game);
        assertEquals(3.5, gamePlus.getMedianCowsPerFarmer());
    }

    @Test
    void test_convertToGamePlus() {
        when(gameRepository.getNumCows(17L)).thenReturn(Optional.of(200));
        when(gameRepository.getNumUsers(17L)).thenReturn(Optional.of(5));
        when(averageCowHealthService.getAverageCowHealth(17L)).thenReturn(85.5);
        when(farmerRepository.findByGameId(17L)).thenReturn(List.of(
                Farmer.builder().numOfCows(10).build(),
                Farmer.builder().numOfCows(20).build(),
                Farmer.builder().numOfCows(30).build(),
                Farmer.builder().numOfCows(40).build(),
                Farmer.builder().numOfCows(100).build()));
        Iterable<GamePlus> gamePlusIterable = gamePlusBuilderService
                .convertToGamePlus(Arrays.asList(game));
        GamePlus gamePlus = gamePlusIterable.iterator().next();
        assertEquals(this.gamePlus, gamePlus);
    }

    @Test
    void test_toGamePlus_withNoFarmers() {
        when(gameRepository.getNumCows(17L)).thenReturn(Optional.empty());
        when(gameRepository.getNumUsers(17L)).thenReturn(Optional.empty());
        when(farmerRepository.findByGameId(17L)).thenReturn(List.of());

        GamePlus gamePlus = gamePlusBuilderService.toGamePlus(game);

        assertEquals(0, gamePlus.getTotalCows());
        assertEquals(0, gamePlus.getTotalUsers());
        Assertions.assertNull(gamePlus.getAverageCowsPerFarmer());
        Assertions.assertNull(gamePlus.getMedianCowsPerFarmer());
        Assertions.assertNull(gamePlus.getMinimumCowsPerFarmer());
        Assertions.assertNull(gamePlus.getMaximumCowsPerFarmer());
        Assertions.assertNull(gamePlus.getStandardDeviationCowsPerFarmer());
        Assertions.assertNull(gamePlus.getAverageCowHealth());
    }

}
