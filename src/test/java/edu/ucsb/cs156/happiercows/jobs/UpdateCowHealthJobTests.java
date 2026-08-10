package edu.ucsb.cs156.happiercows.jobs;

import edu.ucsb.cs156.happiercows.JobTestCase;
import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.CommonsPlus;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.jobs.entities.Job;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.jobs.services.JobContext;
import edu.ucsb.cs156.happiercows.services.CommonsPlusBuilderService;
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
        CommonsRepository commonsRepository;

        @Mock
        FarmerRepository farmerRepository;

        @Mock
        UserRepository userRepository;

        @Mock
        CommonsPlusBuilderService commonsPlusBuilderService;

        private final User user = User
                        .builder()
                        .id(1L)
                        .fullName("Chris Gaucho")
                        .email("cgaucho@example.org")
                        .build();

        private final Commons commons = Commons
                        .builder()
                        .name("test commons")
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
                        .commons(commons)
                        .totalWealth(300)
                        .numOfCows(1)
                        .cowHealth(10.0)
                        .build();



        private final Job job = Job.builder().build();
        private final JobContext ctx = new JobContext(null, job);

        private void runUpdateCowHealthJob() throws Exception {
                var updateCowHealthJob = new UpdateCowHealthJob(commonsRepository, farmerRepository,
                                userRepository, commonsPlusBuilderService);
                updateCowHealthJob.accept(ctx);
        }

        @Test
        void test_log_output_with_no_commons() throws Exception {
                runUpdateCowHealthJob();

                String expected = """
                                Updating cow health...
                                Cow health has been updated!""";
                assertEquals(expected, job.getLog());
        }

        @Test
        void test_skips_commons_when_game_not_in_progress() throws Exception {
                Commons futureCommons = Commons
                                .builder()
                                .name("future commons")
                                .startingDate(LocalDateTime.now().plusDays(5))
                                .lastDate(LocalDateTime.now().plusDays(10))
                                .build();

                List<Commons> listOfCommons = List.of(futureCommons);
                CommonsPlus futureCommonsPlus = CommonsPlus.builder().commons(futureCommons).totalCows(1)
                                .totalUsers(1).build();

                when(commonsRepository.findAll()).thenReturn(listOfCommons);
                when(commonsPlusBuilderService.convertToCommonsPlus(eq(listOfCommons)))
                                .thenReturn(List.of(futureCommonsPlus));

                runUpdateCowHealthJob();

                String expected = """
                                Updating cow health...
                                Skipping Commons id=0 (future commons) because the game is not in progress
                                Cow health has been updated!""";
                assertEquals(expected, job.getLog());
        }

    private void setupUpdateCowHealthTestOnCommons(int totalCows, int numUsers) {
        List<Commons> listOfCommons = List.of(commons); 
        CommonsPlus commonsPlus = CommonsPlus.builder().commons(commons).totalCows(totalCows).totalUsers(numUsers).build();

        List<CommonsPlus> listOfCommonsPlus = List.of(commonsPlus);
        
        when(commonsRepository.findAll()).thenReturn(listOfCommons);
        when(farmerRepository.findByCommonsId(commons.getId())).thenReturn(List.of(farmer));
        when(commonsRepository.getNumCows(commons.getId())).thenReturn(Optional.of(totalCows));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(commonsRepository.getNumUsers(commons.getId())).thenReturn(Optional.of(numUsers));
        when(commonsPlusBuilderService.convertToCommonsPlus(eq(listOfCommons))).thenReturn(listOfCommonsPlus);
        when(commonsPlusBuilderService.toCommonsPlus(eq(commons))).thenReturn(commonsPlus);
    }

        @Test
        void test_uses_above_capacity_update_strategy() throws Exception {
                commons.setAboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Constant);
                double expectedNewHealth = 9.0;

                setupUpdateCowHealthTestOnCommons(101, 1);
                runUpdateCowHealthJob();

                assertEquals(expectedNewHealth, farmer.getCowHealth());

                String expected = """
                                Updating cow health...
                                Commons test commons, degradationRate: 1.0, effectiveCapacity: 100
                                User: Chris Gaucho, numCows: 1, cowHealth: 10.0
                                 old cow health: 10.0, new cow health: 9.0
                                Cow health has been updated!""";
                assertEquals(expected, job.getLog());
        }

        @Test
        void test_uses_below_capacity_update_strategy() throws Exception {
                commons.setBelowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Constant);
                double expectedNewHealth = 11.0;
                setupUpdateCowHealthTestOnCommons(99, 1);
                runUpdateCowHealthJob();

                assertEquals(expectedNewHealth, farmer.getCowHealth());

                String expected = """
                                Updating cow health...
                                Commons test commons, degradationRate: 1.0, effectiveCapacity: 100
                                User: Chris Gaucho, numCows: 1, cowHealth: 10.0
                                 old cow health: 10.0, new cow health: 11.0
                                Cow health has been updated!""";
                assertEquals(expected, job.getLog());
        }

        @Test
        void test_uses_below_capacity_update_strategy_if_equal_to_carrying_capacity() throws Exception {
                commons.setBelowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Constant);
                double expectedNewHealth = 11.0;

                setupUpdateCowHealthTestOnCommons(commons.getCarryingCapacity(), 1);
                runUpdateCowHealthJob();

                assertEquals(expectedNewHealth, farmer.getCowHealth());

                String expected = """
                                Updating cow health...
                                Commons test commons, degradationRate: 1.0, effectiveCapacity: 100
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
                                commonsPlusBuilderService.toCommonsPlus(commons),
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
                                commonsPlusBuilderService.toCommonsPlus(commons),
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
                                .commons(commons)
                                .totalWealth(300)
                                .numOfCows(6)
                                .cowHealth(20)
                                .build();
                commons.setBelowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear);
                
                CommonsPlus commonsPlus = CommonsPlus.builder().commons(commons).totalCows(6).totalUsers(1).build();

                List<CommonsPlus> commonsPlusList = List.of(commonsPlus);
                List<Commons> commonsList = List.of(commons);

                when(commonsRepository.findAll()).thenReturn(commonsList);
                when(commonsPlusBuilderService.convertToCommonsPlus(eq(commonsList))).thenReturn(commonsPlusList);
                when(commonsPlusBuilderService.toCommonsPlus(eq(commons))).thenReturn(commonsPlus);
                when(farmerRepository.findByCommonsId(commons.getId()))
                                .thenReturn(List.of(farmer1, farmer2));
                when(commonsRepository.getNumCows(commons.getId())).thenReturn(Optional.of(99));
                when(userRepository.findById(1L)).thenReturn(Optional.of(user));
                when(commonsRepository.getNumUsers(commons.getId())).thenReturn(Optional.of(2));

                runUpdateCowHealthJob();

                String expected = """
                                Updating cow health...
                                Commons test commons, degradationRate: 1.0, effectiveCapacity: 100
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
                                .commons(commons)
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
                                .commons(commons)
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
                                .commons(commons)
                                .totalWealth(300)
                                .numOfCows(5)
                                .cowHealth(-1.0)
                                .cowDeaths(0)
                                .build();
                commons.setBelowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear);

                CommonsPlus commonsPlus = CommonsPlus.builder().commons(commons).totalCows(5).totalUsers(1).build();

                List<CommonsPlus> commonsPlusList = List.of(commonsPlus);
                List<Commons> commonsList = List.of(commons);

                when(commonsPlusBuilderService.convertToCommonsPlus(eq(commonsList))).thenReturn(commonsPlusList);
                when(commonsPlusBuilderService.toCommonsPlus(eq(commons))).thenReturn(commonsPlus);

                when(commonsRepository.findAll()).thenReturn(List.of(commons));
                when(farmerRepository.findByCommonsId(commons.getId())).thenReturn(List.of(farmer));
                when(commonsRepository.getNumCows(commons.getId())).thenReturn(Optional.of(99));
                when(userRepository.findById(1L)).thenReturn(Optional.of(user));
                when(commonsRepository.getNumUsers(commons.getId())).thenReturn(Optional.of(1));

                runUpdateCowHealthJob();

                String expected = """
                                Updating cow health...
                                Commons test commons, degradationRate: 1.0, effectiveCapacity: 100
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
        void test_skipping_job_when_commons_has_zero_users() throws Exception {
                CommonsPlus commonsPlus = CommonsPlus.builder().commons(commons).totalCows(5).totalUsers(1).build();

                List<CommonsPlus> commonsPlusList = List.of(commonsPlus);
                List<Commons> commonsList = List.of(commons);

                when(commonsPlusBuilderService.convertToCommonsPlus(eq(commonsList))).thenReturn(commonsPlusList);
                when(commonsPlusBuilderService.toCommonsPlus(eq(commons))).thenReturn(commonsPlus);
                commons.setBelowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear);

                when(commonsRepository.findAll()).thenReturn(List.of(commons));
                when(commonsRepository.getNumUsers(commons.getId())).thenReturn(Optional.of(0));

                runUpdateCowHealthJob();

                String expected = """
                                Updating cow health...
                                Commons test commons, degradationRate: 1.0, effectiveCapacity: 100
                                No users in this commons, skipping
                                Cow health has been updated!""";

                assertEquals(expected, job.getLog());
        }

        @Test
        void test_throws_exception_when_get_num_cows_fails() {
                setupUpdateCowHealthTestOnCommons(100, 1);
                commons.setId(117);
                when(commonsRepository.getNumCows(commons.getId())).thenReturn(Optional.empty());
                when(commonsRepository.getNumUsers(commons.getId())).thenReturn(Optional.of(1));

                var updateCowHealthJob = new UpdateCowHealthJob(commonsRepository,
                                farmerRepository,
                                userRepository, commonsPlusBuilderService);

                var thrown = Assertions.assertThrows(RuntimeException.class, () -> {
                        updateCowHealthJob.accept(ctx);
                });

                Assertions.assertEquals("Error calling getNumCows(117)",
                                thrown.getMessage());
        }

        @Test
        void test_throws_exception_when_get_num_users_fails() {
                setupUpdateCowHealthTestOnCommons(100, 1);
                commons.setId(117);
                when(commonsRepository.getNumUsers(commons.getId())).thenReturn(Optional.empty());

                var updateCowHealthJob = new UpdateCowHealthJob(commonsRepository,
                                farmerRepository,
                                userRepository, commonsPlusBuilderService);

                var thrown = Assertions.assertThrows(RuntimeException.class, () -> {
                        updateCowHealthJob.accept(ctx);
                });

                Assertions.assertEquals("Error calling getNumUsers(117)",
                                thrown.getMessage());
        }

        @Test
        void commons_plus_builder_service_getter_returns_value_from_constructor() {
                var job = new UpdateCowHealthJob(commonsRepository, farmerRepository,
                                userRepository, commonsPlusBuilderService);

                assertSame(commonsPlusBuilderService, job.getCommonsPlusBuilderService());
        }
}
