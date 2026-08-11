package edu.ucsb.cs156.happiercows.jobs;

import edu.ucsb.cs156.happiercows.JobTestCase;
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.jobs.entities.Job;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.jobs.services.JobContext;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
@ContextConfiguration
public class SetCowHealthJobTests extends JobTestCase {
    @Mock
    GameRepository gameRepository;

    @Mock
    FarmerRepository farmerRepository;

    @Mock
    UserRepository userRepository;

    private User user = User
            .builder()
            .id(1L)
            .fullName("Chris Gaucho")
            .email("cgaucho@example.org")
            .build();

    private Game testGame = Game
            .builder()
            .id(117L)
            .name("test game")
            .cowPrice(10)
            .milkPrice(2)
            .startingBalance(300)
            .startingDate(LocalDateTime.now().minusDays(5))
            .lastDate(LocalDateTime.now().plusDays(5))
            .carryingCapacity(100)
            .degradationRate(0.01)
            .build();


    @Test
    void error_msg_when_no_game_found() throws Exception {

        // Arrange

        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        when(gameRepository.findById(any())).thenReturn(Optional.empty());

        // Act
        SetCowHealthJob setCowHealthJob = new SetCowHealthJob(117L, 2.0, gameRepository, farmerRepository,
                userRepository);
        setCowHealthJob.accept(ctx);

        // Assert
        String expected = """
                Setting cow health...
                No game found for id 117""";

        assertEquals(expected, jobStarted.getLog());

    }


    @Test
    void test_skips_game_when_game_not_in_progress() throws Exception {

        // Arrange
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        Game futureGame = Game
                .builder()
                .id(117L)
                .name("future game")
                .cowPrice(10)
                .milkPrice(2)
                .startingBalance(300)
                .startingDate(LocalDateTime.now().plusDays(5))
                .lastDate(LocalDateTime.now().plusDays(10))
                .carryingCapacity(100)
                .degradationRate(0.01)
                .build();

        when(gameRepository.findById(117L)).thenReturn(Optional.of(futureGame));

        // Act
        SetCowHealthJob setCowHealthJob = new SetCowHealthJob(117L, 2.0, gameRepository, farmerRepository,
                userRepository);
        setCowHealthJob.accept(ctx);

        // Assert
        String expected = """
                Setting cow health...
                Skipping Game id=117 (future game) because the game is not in progress""";

        assertEquals(expected, jobStarted.getLog());
    }

    Farmer getFarmer() {
        return Farmer
                .builder()
                .user(user)
                .game(testGame)
                .totalWealth(300)
                .numOfCows(5)
                .cowHealth(50)
                .build();
    }

    @Test
    void test_updating_to_new_values_for_multiple() throws Exception {

        // Arrange
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        var farmerList = Arrays.asList(
                getFarmer(),
                getFarmer(),
                getFarmer()
        );

        Farmer newFarmer = Farmer
                .builder()
                .user(user)
                .game(testGame)
                .totalWealth(300 - testGame.getCowPrice())
                .numOfCows(5)
                .cowHealth(2.0)
                .build();

        when(gameRepository.findById(117L)).thenReturn(Optional.of(testGame));
        when(farmerRepository.findByGameId(testGame.getId()))
                .thenReturn(farmerList);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // Act
        SetCowHealthJob setCowHealthJob = new SetCowHealthJob(117, 2, gameRepository, farmerRepository,
                userRepository);
        setCowHealthJob.accept(ctx);

        // Assert

        String expected = """
                Setting cow health...
                Game test game
                User: Chris Gaucho, numCows: 5, cowHealth: 50.0
                 old cow health: 50.0, new cow health: 2.0
                User: Chris Gaucho, numCows: 5, cowHealth: 50.0
                 old cow health: 50.0, new cow health: 2.0
                User: Chris Gaucho, numCows: 5, cowHealth: 50.0
                 old cow health: 50.0, new cow health: 2.0
                Cow health has been set!""";

        assertEquals(expected, jobStarted.getLog());
        farmerList.forEach(farmer -> assertEquals(newFarmer.getCowHealth(), farmer.getCowHealth()));
    }
}
