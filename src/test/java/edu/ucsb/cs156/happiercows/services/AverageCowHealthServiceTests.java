package edu.ucsb.cs156.happiercows.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.entities.FarmerKey;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.strategies.CowHealthUpdateStrategies;

@ExtendWith(SpringExtension.class)
@Import(AverageCowHealthService.class)
@ContextConfiguration
public class AverageCowHealthServiceTests {
    
    @MockBean
    UserRepository userRepository;
  
    @MockBean
    GameRepository gameRepository;
  
    @MockBean
    FarmerRepository farmerRepository;    

    @Autowired
    AverageCowHealthService averageCowHealthService;

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

    private User user1 = User
        .builder()
        .id(42L)
        .fullName("Chris Gaucho")
        .email("cgaucho@example.org")
        .build();

    Farmer farmer1 = Farmer
        .builder()
        .user(user1)
        .username("Chris Gaucho")
        .game(game)
        .totalWealth(300)
        .numOfCows(20)
        .cowHealth(10)
        .cowsBought(10)
        .cowsSold(23)
        .cowDeaths(6)
        .build();

    private User user2 = User
        .builder()
        .id(43L)
        .fullName("John Doe")
        .email("jdoe@example.org")
        .build();

    Farmer farmer2 = Farmer
        .builder()
        .user(user2)
        .username("John Doe")
        .game(game)
        .totalWealth(300)
        .numOfCows(100)
        .cowHealth(22)
        .cowsBought(20)
        .cowsSold(12)
        .cowDeaths(2)
        .build();


    @BeforeEach
    void setup() {
        farmer1.setId(new FarmerKey(user1.getId(), game.getId()));
        farmer2.setId(new FarmerKey(user2.getId(), game.getId()));
    }

    @Test
    void test_getAverageCowHealthOneUser() {
        // arrange

        when(gameRepository.findById(17L)).thenReturn(Optional.of(game));
        when(farmerRepository.findByGameId(game.getId()))
                .thenReturn(Arrays.asList(farmer1));
        when(gameRepository.getNumUsers(game.getId())).thenReturn(Optional.of(Integer.valueOf(1)));
        when(gameRepository.getNumCows(game.getId())).thenReturn(Optional.of(Integer.valueOf(20)));
        when(userRepository.findById(42L)).thenReturn(Optional.of(user1));

        // act

        double averageCowHealth = averageCowHealthService.getAverageCowHealth(17L);

        // assert
        assertEquals(10, averageCowHealth);
    }

    @Test
    void test_getAverageCowHealthMultipleUsers() {
        // arrange

        when(gameRepository.findById(17L)).thenReturn(Optional.of(game));
        when(farmerRepository.findByGameId(game.getId()))
                .thenReturn(Arrays.asList(farmer1,farmer2));
        when(gameRepository.getNumUsers(game.getId())).thenReturn(Optional.of(Integer.valueOf(1)));
        when(gameRepository.getNumCows(game.getId())).thenReturn(Optional.of(Integer.valueOf(120)));
        when(userRepository.findById(42L)).thenReturn(Optional.of(user1));
        when(userRepository.findById(43L)).thenReturn(Optional.of(user2));

        // act

        double averageCowHealth = averageCowHealthService.getAverageCowHealth(17L);

        // assert
        assertEquals(20, averageCowHealth);
    }

    @Test
    void test_getAverageCowHealthThrowsException() {
        when(farmerRepository.findByGameId(1L)).thenReturn(Arrays.asList());

        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            averageCowHealthService.getAverageCowHealth(1L);
        });
    }

    @Test
    void test_getTotalNumCowsThrowsException() {
        when(farmerRepository.findByGameId(1L)).thenReturn(Arrays.asList());

        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            averageCowHealthService.getTotalNumCows(1L);
        });
    }
}
