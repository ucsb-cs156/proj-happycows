package edu.ucsb.cs156.happiercows.jobs;

import edu.ucsb.cs156.happiercows.JobTestCase;
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.GamePlus;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.jobs.entities.Job;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.services.GamePlusBuilderService;
import edu.ucsb.cs156.jobs.services.JobContext;
import edu.ucsb.cs156.happiercows.strategies.CowHealthUpdateStrategies;
import edu.ucsb.cs156.happiercows.jobs.UpdateCowHealthJob;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
@ContextConfiguration
public class UpdateCowHealthJobIndTests extends JobTestCase {
        @Mock
        GameRepository gameRepository;

        @Mock
        FarmerRepository farmerRepository;

        @Mock
        UserRepository userRepository;
        
        @Mock
        GamePlusBuilderService gamePlusBuilderService;

        @Mock
        UpdateCowHealthJob updateCowHealthJob;

        private final User user = User
                        .builder()
                        .id(1L)
                        .fullName("Chris Gaucho")
                        .email("cgaucho@example.org")
                        .build();

        private final Game game = Game
                        .builder()
                        .name("test game")
                        .cowPrice(10)
                        .milkPrice(2)
                        .startingBalance(300)
                        .startingDate(LocalDateTime.now().minusDays(5))
                        .lastDate(LocalDateTime.now().plusDays(5))
                        .capacityPerUser(1)
                        .carryingCapacity(100)
                        .degradationRate(1)
                        .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Noop)
                        .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Noop)
                        .build();

        private final GamePlus gamePlus = GamePlus
                        .builder()
                        .game(game)
                        .totalCows(1)
                        .totalUsers(1)
                        .build();

        private final Farmer farmer = Farmer
                        .builder()
                        .user(user)
                        .game(game)
                        .totalWealth(300)
                        .numOfCows(1)
                        .cowHealth(10.0)
                        .build();

        private final Job job = Job.builder().build();
        private final JobContext ctx = new JobContext(null, job);

        private void runUpdateCowHealthJob() throws Exception {
                var updateCowHealthJobInd = new UpdateCowHealthJobInd(gameRepository, farmerRepository,
                                userRepository, gamePlusBuilderService, 1L);
                updateCowHealthJobInd.accept(ctx);
        }

        @Test
        void test_log_output_with_no_game() throws Exception {
                runUpdateCowHealthJob();

                String expected = """
                                Updating cow health...
                                No game found for id 1""";
                assertEquals(expected, job.getLog());
        }


    @Test
    void test_update_one_game() throws Exception {
        
        List<Game> listOfGame = List.of(game); 
        GamePlus gamePlus = GamePlus.builder().game(game).totalCows(1).totalUsers(1).build();

        List<GamePlus> listOfGamePlus = List.of(gamePlus);
        game.setBelowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear);

        when(gameRepository.findAll()).thenReturn(listOfGame);
        when(farmerRepository.findByGameId(game.getId())).thenReturn(List.of(farmer));
        when(gameRepository.getNumCows(game.getId())).thenReturn(Optional.of(1));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(gameRepository.getNumUsers(game.getId())).thenReturn(Optional.of(1));
        when(gamePlusBuilderService.convertToGamePlus(eq(listOfGame))).thenReturn(listOfGamePlus);
        when(gamePlusBuilderService.toGamePlus(eq(game))).thenReturn(gamePlus);
        when(gameRepository.findById(eq(1L))).thenReturn(Optional.of(game));

        

        runUpdateCowHealthJob();

        String expected = """
                        Updating cow health...
                        Game test game, degradationRate: 1.0, effectiveCapacity: 100
                        User: Chris Gaucho, numCows: 1, cowHealth: 10.0
                         old cow health: 10.0, new cow health: 100.0
                        Cow health has been updated!""";

        assertEquals(expected, job.getLog());
    }

    @Test
    void test_skips_game_when_game_not_in_progress() throws Exception {

        Game futureGame = Game
                .builder()
                .name("future game")
                .startingDate(LocalDateTime.now().plusDays(5))
                .lastDate(LocalDateTime.now().plusDays(10))
                .build();

        when(gameRepository.findById(eq(1L))).thenReturn(Optional.of(futureGame));

        runUpdateCowHealthJob();

        String expected = """
                        Updating cow health...
                        Skipping Game id=0 (future game) because the game is not in progress""";

        assertEquals(expected, job.getLog());
    }

    @Test
    void game_id_getter_returns_value_from_constructor() {
        UpdateCowHealthJobInd jobInd = new UpdateCowHealthJobInd(gameRepository, farmerRepository,
                userRepository, gamePlusBuilderService, 17L);

        assertEquals(17L, jobInd.getGameID());
    }

}
