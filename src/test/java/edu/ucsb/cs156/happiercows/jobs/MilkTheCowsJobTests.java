package edu.ucsb.cs156.happiercows.jobs;

import edu.ucsb.cs156.happiercows.JobTestCase;
import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.jobs.entities.Job;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.ProfitRepository;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
@ContextConfiguration
public class MilkTheCowsJobTests extends JobTestCase {
    @Mock
    CommonsRepository commonsRepository;

    @Mock
    FarmerRepository farmerRepository;

    @Mock
    UserRepository userRepository;

    @Mock
    ProfitRepository profitRepository;

    private User user = User
            .builder()
            .id(1L)
            .fullName("Chris Gaucho")
            .email("cgaucho@example.org")
            .build();

    private Commons testCommons = Commons
            .builder()
            .name("test commons")
            .cowPrice(10)
            .milkPrice(2)
            .startingBalance(300)
            .startingDate(LocalDateTime.now().minusDays(5))
            .lastDate(LocalDateTime.now().plusDays(5))
            .carryingCapacity(100)
            .degradationRate(0.01)
            .build();


    @Test
    void test_log_output_no_commons() throws Exception {

        // Arrange

        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        // Act
        MilkTheCowsJob milkTheCowsJob = new MilkTheCowsJob(commonsRepository, farmerRepository,
                userRepository, profitRepository);

        milkTheCowsJob.accept(ctx);

        // Assert

        String expected = """
                Starting to milk the cows
                Cows have been milked!""";

        assertEquals(expected, jobStarted.getLog());
    }

    @Test
    void test_log_output_with_commons_and_farmer() throws Exception {

        // Arrange
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        Farmer origFarmer = Farmer
                .builder()
                .user(user)
                .commons(testCommons)
                .totalWealth(300)
                .numOfCows(1)
                .cowHealth(10)
                .build();

        when(commonsRepository.findAll()).thenReturn(Arrays.asList(testCommons));
        when(farmerRepository.findByCommonsId(testCommons.getId()))
                .thenReturn(Arrays.asList(origFarmer));
        when(commonsRepository.getNumCows(testCommons.getId())).thenReturn(Optional.of(Integer.valueOf(1)));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // Act
        MilkTheCowsJob MilkTheCowsJob = new MilkTheCowsJob(commonsRepository, farmerRepository,
                userRepository, profitRepository);
        MilkTheCowsJob.accept(ctx);

        // Assert

        String expected = """
                Starting to milk the cows
                Milking cows for Commons: test commons, Milk Price: $2.00
                User: Chris Gaucho, numCows: 1, cowHealth: 10.0, totalWealth: $300.00
                Profit for user: Chris Gaucho is: $0.20, newWealth: $300.20
                Cows have been milked!""";

        assertEquals(expected, jobStarted.getLog());
    }

    @Test
    void test_skips_commons_when_game_not_in_progress() throws Exception {

        // Arrange
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        Commons futureCommons = Commons
                .builder()
                .name("future commons")
                .cowPrice(10)
                .milkPrice(2)
                .startingBalance(300)
                .startingDate(LocalDateTime.now().plusDays(5))
                .lastDate(LocalDateTime.now().plusDays(10))
                .carryingCapacity(100)
                .degradationRate(0.01)
                .build();

        when(commonsRepository.findAll()).thenReturn(Arrays.asList(futureCommons));

        // Act
        MilkTheCowsJob milkTheCowsJob = new MilkTheCowsJob(commonsRepository, farmerRepository,
                userRepository, profitRepository);
        milkTheCowsJob.accept(ctx);

        // Assert
        String expected = """
                Starting to milk the cows
                Skipping Commons id=0 (future commons) because the game is not in progress
                Cows have been milked!""";

        assertEquals(expected, jobStarted.getLog());
    }

    @Test
    void test_milk_cows() throws Exception {

        // Arrange
        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        Farmer origFarmer = Farmer
                .builder()
                .user(user)
                .commons(testCommons)
                .totalWealth(300)
                .numOfCows(1)
                .cowHealth(10)
                .build();

        Farmer updatedFarmer = Farmer
                .builder()
                .user(user)
                .commons(testCommons)
                .totalWealth(300.20)
                .numOfCows(1)
                .cowHealth(10)
                .build();

        Commons commonsTemp[] = {testCommons};
        Farmer farmerTemp[] = {origFarmer};
        when(commonsRepository.findAll()).thenReturn(Arrays.asList(commonsTemp));
        when(farmerRepository.findByCommonsId(testCommons.getId()))
                .thenReturn(Arrays.asList(farmerTemp));
        when(commonsRepository.getNumCows(testCommons.getId())).thenReturn(Optional.of(Integer.valueOf(1)));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(farmerRepository.save(updatedFarmer)).thenReturn(updatedFarmer);


        // Act
        MilkTheCowsJob.milkCows(ctx, testCommons, origFarmer, profitRepository, farmerRepository);

        // Assert

        String expected = """
                User: Chris Gaucho, numCows: 1, cowHealth: 10.0, totalWealth: $300.00
                Profit for user: Chris Gaucho is: $0.20, newWealth: $300.20""";

        verify(farmerRepository).save(updatedFarmer);
        assertEquals(expected, jobStarted.getLog());
    }
}
