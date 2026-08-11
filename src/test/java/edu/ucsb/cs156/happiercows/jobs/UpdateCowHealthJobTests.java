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
import edu.ucsb.cs156.jobs.services.JobContext;
import edu.ucsb.cs156.happiercows.services.GamePlusBuilderService;
import edu.ucsb.cs156.happiercows.strategies.CowHealthUpdateStrategies;
import edu.ucsb.cs156.happiercows.strategies.CowHealthUpdateStrategy;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
@ContextConfiguration
public class UpdateCowHealthJobTests extends JobTestCase {
        @Mock
        GameRepository gameRepository;

        @Mock
        FarmerRepository farmerRepository;

        @Mock
        UserRepository userRepository;

        @Mock
        GamePlusBuilderService gamePlusBuilderService;

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
                        .capacityPerUser(0)
                        .carryingCapacity(100)
                        .degradationRate(1)
                        .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Noop)
                        .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Noop)
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
                var updateCowHealthJob = new UpdateCowHealthJob(gameRepository, farmerRepository,
                                userRepository, gamePlusBuilderService);
                updateCowHealthJob.accept(ctx);
        }

        @Test
        void test_log_output_with_no_game() throws Exception {
                runUpdateCowHealthJob();

                String expected = """
                                Updating cow health...
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

                List<Game> listOfGame = List.of(futureGame);
                GamePlus futureGamePlus = GamePlus.builder().game(futureGame).totalCows(1)
                                .totalUsers(1).build();

                when(gameRepository.findAll()).thenReturn(listOfGame);
                when(gamePlusBuilderService.convertToGamePlus(eq(listOfGame)))
                                .thenReturn(List.of(futureGamePlus));

                runUpdateCowHealthJob();

                String expected = """
                                Updating cow health...
                                Skipping Game id=0 (future game) because the game is not in progress
                                Cow health has been updated!""";
                assertEquals(expected, job.getLog());
        }

    private void setupUpdateCowHealthTestOnGame(int totalCows, int numUsers) {
        List<Game> listOfGame = List.of(game); 
        GamePlus gamePlus = GamePlus.builder().game(game).totalCows(totalCows).totalUsers(numUsers).build();

        List<GamePlus> listOfGamePlus = List.of(gamePlus);
        
        when(gameRepository.findAll()).thenReturn(listOfGame);
        when(farmerRepository.findByGameId(game.getId())).thenReturn(List.of(farmer));
        when(gameRepository.getNumCows(game.getId())).thenReturn(Optional.of(totalCows));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(gameRepository.getNumUsers(game.getId())).thenReturn(Optional.of(numUsers));
        when(gamePlusBuilderService.convertToGamePlus(eq(listOfGame))).thenReturn(listOfGamePlus);
        when(gamePlusBuilderService.toGamePlus(eq(game))).thenReturn(gamePlus);
    }

        @Test
        void test_uses_above_capacity_update_strategy() throws Exception {
                game.setAboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Constant);
                double expectedNewHealth = 9.0;

                setupUpdateCowHealthTestOnGame(101, 1);
                runUpdateCowHealthJob();

                assertEquals(expectedNewHealth, farmer.getCowHealth());

                String expected = """
                                Updating cow health...
                                Game test game, degradationRate: 1.0, effectiveCapacity: 100
                                User: Chris Gaucho, numCows: 1, cowHealth: 10.0
                                 old cow health: 10.0, new cow health: 9.0
                                Cow health has been updated!""";
                assertEquals(expected, job.getLog());
        }

        @Test
        void test_uses_below_capacity_update_strategy() throws Exception {
                game.setBelowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Constant);
                double expectedNewHealth = 11.0;
                setupUpdateCowHealthTestOnGame(99, 1);
                runUpdateCowHealthJob();

                assertEquals(expectedNewHealth, farmer.getCowHealth());

                String expected = """
                                Updating cow health...
                                Game test game, degradationRate: 1.0, effectiveCapacity: 100
                                User: Chris Gaucho, numCows: 1, cowHealth: 10.0
                                 old cow health: 10.0, new cow health: 11.0
                                Cow health has been updated!""";
                assertEquals(expected, job.getLog());
        }

        @Test
        void test_uses_below_capacity_update_strategy_if_equal_to_carrying_capacity() throws Exception {
                game.setBelowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Constant);
                double expectedNewHealth = 11.0;

                setupUpdateCowHealthTestOnGame(game.getCarryingCapacity(), 1);
                runUpdateCowHealthJob();

                assertEquals(expectedNewHealth, farmer.getCowHealth());

                String expected = """
                                Updating cow health...
                                Game test game, degradationRate: 1.0, effectiveCapacity: 100
                                User: Chris Gaucho, numCows: 1, cowHealth: 10.0
                                 old cow health: 10.0, new cow health: 11.0
                                Cow health has been updated!""";
                assertEquals(expected, job.getLog());
        }

        @Test
        void test_cow_health_minimum_is_0() throws Exception {
                var mockStrategy = mock(CowHealthUpdateStrategy.class);
                when(mockStrategy.calculateNewCowHealth(any(), any(), anyInt())).thenReturn(-1.0);
                var newHealth = UpdateCowHealthJob.calculateNewCowHealthUsingStrategy(
                                mockStrategy,
                                gamePlusBuilderService.toGamePlus(game),
                                farmer,
                                1);
                assertEquals(0.0, newHealth);
        }

        @Test
        void test_cow_health_maximum_is_100() throws Exception {
                var mockStrategy = mock(CowHealthUpdateStrategy.class);
                when(mockStrategy.calculateNewCowHealth(any(), any(), anyInt())).thenReturn(101.0);
                var newHealth = UpdateCowHealthJob.calculateNewCowHealthUsingStrategy(
                                mockStrategy,
                                gamePlusBuilderService.toGamePlus(game),
                                farmer,
                                1);
                assertEquals(100.0, newHealth);
        }

        @Test
        void test_updating_values_for_multiple_users() throws Exception {
                var farmer1 = farmer;
                var farmer2 = Farmer
                                .builder()
                                .user(user)
                                .game(game)
                                .totalWealth(300)
                                .numOfCows(6)
                                .cowHealth(20)
                                .build();
                game.setBelowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear);
                
                GamePlus gamePlus = GamePlus.builder().game(game).totalCows(6).totalUsers(1).build();

                List<GamePlus> gamePlusList = List.of(gamePlus);
                List<Game> gameList = List.of(game);

                when(gameRepository.findAll()).thenReturn(gameList);
                when(gamePlusBuilderService.convertToGamePlus(eq(gameList))).thenReturn(gamePlusList);
                when(gamePlusBuilderService.toGamePlus(eq(game))).thenReturn(gamePlus);
                when(farmerRepository.findByGameId(game.getId()))
                                .thenReturn(List.of(farmer1, farmer2));
                when(gameRepository.getNumCows(game.getId())).thenReturn(Optional.of(99));
                when(userRepository.findById(1L)).thenReturn(Optional.of(user));
                when(gameRepository.getNumUsers(game.getId())).thenReturn(Optional.of(2));

                runUpdateCowHealthJob();

                String expected = """
                                Updating cow health...
                                Game test game, degradationRate: 1.0, effectiveCapacity: 100
                                User: Chris Gaucho, numCows: 1, cowHealth: 10.0
                                 old cow health: 10.0, new cow health: 11.0
                                User: Chris Gaucho, numCows: 6, cowHealth: 20.0
                                 old cow health: 20.0, new cow health: 21.0
                                Cow health has been updated!""";

                assertEquals(expected, job.getLog());

                assertEquals(11.0, farmer1.getCowHealth());
                assertEquals(21.0, farmer2.getCowHealth());
        }

        @Test
        void test_calculateCowDeaths_health_zero() throws Exception {
                // arrange
                Farmer farmer = Farmer
                                .builder()
                                .user(user)
                                .game(game)
                                .totalWealth(300)
                                .numOfCows(5)
                                .cowHealth(0.0)
                                .cowDeaths(0)
                                .build();

                // act
                UpdateCowHealthJob.calculateCowDeaths(farmer, ctx);

                // assert
                assertEquals(0, farmer.getNumOfCows());
                assertEquals(5, farmer.getCowDeaths());
                assertEquals(100.0, farmer.getCowHealth());
        }

        @Test
        void test_calculateCowDeaths_health_nonZero() throws Exception {
                // arrange
                Farmer farmer = Farmer
                                .builder()
                                .user(user)
                                .game(game)
                                .totalWealth(300)
                                .numOfCows(5)
                                .cowHealth(1.0)
                                .cowDeaths(42)
                                .build();

                // act
                UpdateCowHealthJob.calculateCowDeaths(farmer, ctx);

                // assert
                assertEquals(5, farmer.getNumOfCows());
                assertEquals(42, farmer.getCowDeaths());
                assertEquals(1.0, farmer.getCowHealth());
        }

        @Test
        void test_cowDeaths_in_job_context() throws Exception {
                Farmer farmer = Farmer
                                .builder()
                                .user(user)
                                .game(game)
                                .totalWealth(300)
                                .numOfCows(5)
                                .cowHealth(-1.0)
                                .cowDeaths(0)
                                .build();
                game.setBelowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear);

                GamePlus gamePlus = GamePlus.builder().game(game).totalCows(5).totalUsers(1).build();

                List<GamePlus> gamePlusList = List.of(gamePlus);
                List<Game> gameList = List.of(game);

                when(gamePlusBuilderService.convertToGamePlus(eq(gameList))).thenReturn(gamePlusList);
                when(gamePlusBuilderService.toGamePlus(eq(game))).thenReturn(gamePlus);

                when(gameRepository.findAll()).thenReturn(List.of(game));
                when(farmerRepository.findByGameId(game.getId())).thenReturn(List.of(farmer));
                when(gameRepository.getNumCows(game.getId())).thenReturn(Optional.of(99));
                when(userRepository.findById(1L)).thenReturn(Optional.of(user));
                when(gameRepository.getNumUsers(game.getId())).thenReturn(Optional.of(1));

                runUpdateCowHealthJob();

                String expected = """
                                Updating cow health...
                                Game test game, degradationRate: 1.0, effectiveCapacity: 100
                                User: Chris Gaucho, numCows: 5, cowHealth: -1.0
                                 5 cows for this user died.
                                 old cow health: -1.0, new cow health: 100.0
                                Cow health has been updated!""";

                assertEquals(expected, job.getLog());

                assertEquals(0, farmer.getNumOfCows());
                assertEquals(5, farmer.getCowDeaths());
                assertEquals(100.0, farmer.getCowHealth());
        }

        @Test
        void test_skipping_job_when_game_has_zero_users() throws Exception {
                GamePlus gamePlus = GamePlus.builder().game(game).totalCows(5).totalUsers(1).build();

                List<GamePlus> gamePlusList = List.of(gamePlus);
                List<Game> gameList = List.of(game);

                when(gamePlusBuilderService.convertToGamePlus(eq(gameList))).thenReturn(gamePlusList);
                when(gamePlusBuilderService.toGamePlus(eq(game))).thenReturn(gamePlus);
                game.setBelowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear);

                when(gameRepository.findAll()).thenReturn(List.of(game));
                when(gameRepository.getNumUsers(game.getId())).thenReturn(Optional.of(0));

                runUpdateCowHealthJob();

                String expected = """
                                Updating cow health...
                                Game test game, degradationRate: 1.0, effectiveCapacity: 100
                                No users in this game, skipping
                                Cow health has been updated!""";

                assertEquals(expected, job.getLog());
        }

        @Test
        void test_throws_exception_when_get_num_cows_fails() {
                setupUpdateCowHealthTestOnGame(100, 1);
                game.setId(117);
                when(gameRepository.getNumCows(game.getId())).thenReturn(Optional.empty());
                when(gameRepository.getNumUsers(game.getId())).thenReturn(Optional.of(1));

                var updateCowHealthJob = new UpdateCowHealthJob(gameRepository,
                                farmerRepository,
                                userRepository, gamePlusBuilderService);

                var thrown = Assertions.assertThrows(RuntimeException.class, () -> {
                        updateCowHealthJob.accept(ctx);
                });

                Assertions.assertEquals("Error calling getNumCows(117)",
                                thrown.getMessage());
        }

        @Test
        void test_throws_exception_when_get_num_users_fails() {
                setupUpdateCowHealthTestOnGame(100, 1);
                game.setId(117);
                when(gameRepository.getNumUsers(game.getId())).thenReturn(Optional.empty());

                var updateCowHealthJob = new UpdateCowHealthJob(gameRepository,
                                farmerRepository,
                                userRepository, gamePlusBuilderService);

                var thrown = Assertions.assertThrows(RuntimeException.class, () -> {
                        updateCowHealthJob.accept(ctx);
                });

                Assertions.assertEquals("Error calling getNumUsers(117)",
                                thrown.getMessage());
        }

        @Test
        void game_plus_builder_service_getter_returns_value_from_constructor() {
                var job = new UpdateCowHealthJob(gameRepository, farmerRepository,
                                userRepository, gamePlusBuilderService);

                assertSame(gamePlusBuilderService, job.getGamePlusBuilderService());
        }
}
