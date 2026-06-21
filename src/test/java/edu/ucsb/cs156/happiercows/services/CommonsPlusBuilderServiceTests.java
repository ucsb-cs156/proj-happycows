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

import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.CommonsPlus;
import edu.ucsb.cs156.happiercows.entities.UserCommons;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.UserCommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.strategies.CowHealthUpdateStrategies;

@ExtendWith(SpringExtension.class)
@Import(CommonsPlusBuilderService.class)
@ContextConfiguration
public class CommonsPlusBuilderServiceTests {
    @MockitoBean
    UserRepository userRepository;

    @MockitoBean
    CommonsRepository commonsRepository;

    @MockitoBean
    UserCommonsRepository userCommonsRepository;

    @Autowired
    CommonsPlusBuilderService commonsPlusBuilderService;

    private Commons commons = Commons
            .builder()
            .id(17L)
            .name("test commons")
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

    private CommonsPlus commonsPlus = CommonsPlus
            .builder()
            .commons(commons)
            .totalCows(200)
            .totalUsers(5)
            .averageCowsPerFarmer(40.0)
            .medianCowsPerFarmer(30.0)
            .minimumCowsPerFarmer(10)
            .maximumCowsPerFarmer(100)
            .standardDeviationCowsPerFarmer(31.622776601683793)
            .build();

    @Test
    void test_toCommonsPlus() {
        when(commonsRepository.getNumCows(17L)).thenReturn(Optional.of(200));
        when(commonsRepository.getNumUsers(17L)).thenReturn(Optional.of(5));
        when(userCommonsRepository.findByCommonsId(17L)).thenReturn(List.of(
                UserCommons.builder().numOfCows(10).build(),
                UserCommons.builder().numOfCows(20).build(),
                UserCommons.builder().numOfCows(30).build(),
                UserCommons.builder().numOfCows(40).build(),
                UserCommons.builder().numOfCows(100).build()));
        CommonsPlus commonsPlus = commonsPlusBuilderService.toCommonsPlus(commons);
        assertEquals(commonsPlus, this.commonsPlus);
    }

    @Test
    void test_toCommonsPlus_median_when_numUsers_is_even_and_users_are_unsorted() {
        when(commonsRepository.getNumCows(17L)).thenReturn(Optional.of(21));
        when(commonsRepository.getNumUsers(17L)).thenReturn(Optional.of(6));
        when(userCommonsRepository.findByCommonsId(17L)).thenReturn(List.of(
                UserCommons.builder().numOfCows(1).build(),
                UserCommons.builder().numOfCows(4).build(),
                UserCommons.builder().numOfCows(2).build(),
                UserCommons.builder().numOfCows(3).build(),
                UserCommons.builder().numOfCows(5).build(),
                UserCommons.builder().numOfCows(6).build()));

        CommonsPlus commonsPlus = commonsPlusBuilderService.toCommonsPlus(commons);
        assertEquals(3.5, commonsPlus.getMedianCowsPerFarmer());
    }

    @Test
    void test_toCommonsPlus_median_when_users_are_unsorted() {
        when(commonsRepository.getNumCows(17L)).thenReturn(Optional.of(21));
        when(commonsRepository.getNumUsers(17L)).thenReturn(Optional.of(6));
        when(userCommonsRepository.findByCommonsId(17L)).thenReturn(List.of(
                UserCommons.builder().numOfCows(3).build(),
                UserCommons.builder().numOfCows(1).build(),
                UserCommons.builder().numOfCows(5).build(),
                UserCommons.builder().numOfCows(2).build(),
                UserCommons.builder().numOfCows(4).build(),
                UserCommons.builder().numOfCows(6).build()));

        CommonsPlus commonsPlus = commonsPlusBuilderService.toCommonsPlus(commons);
        assertEquals(3.5, commonsPlus.getMedianCowsPerFarmer());
    }

    @Test
    void test_convertToCommonsPlus() {
        when(commonsRepository.getNumCows(17L)).thenReturn(Optional.of(200));
        when(commonsRepository.getNumUsers(17L)).thenReturn(Optional.of(5));
        when(userCommonsRepository.findByCommonsId(17L)).thenReturn(List.of(
                UserCommons.builder().numOfCows(10).build(),
                UserCommons.builder().numOfCows(20).build(),
                UserCommons.builder().numOfCows(30).build(),
                UserCommons.builder().numOfCows(40).build(),
                UserCommons.builder().numOfCows(100).build()));
        Iterable<CommonsPlus> commonsPlusIterable = commonsPlusBuilderService
                .convertToCommonsPlus(Arrays.asList(commons));
        CommonsPlus commonsPlus = commonsPlusIterable.iterator().next();
        assertEquals(this.commonsPlus, commonsPlus);
    }

    @Test
    void test_toCommonsPlus_withNoFarmers() {
        when(commonsRepository.getNumCows(17L)).thenReturn(Optional.empty());
        when(commonsRepository.getNumUsers(17L)).thenReturn(Optional.empty());
        when(userCommonsRepository.findByCommonsId(17L)).thenReturn(List.of());

        CommonsPlus commonsPlus = commonsPlusBuilderService.toCommonsPlus(commons);

        assertEquals(0, commonsPlus.getTotalCows());
        assertEquals(0, commonsPlus.getTotalUsers());
        Assertions.assertNull(commonsPlus.getAverageCowsPerFarmer());
        Assertions.assertNull(commonsPlus.getMedianCowsPerFarmer());
        Assertions.assertNull(commonsPlus.getMinimumCowsPerFarmer());
        Assertions.assertNull(commonsPlus.getMaximumCowsPerFarmer());
        Assertions.assertNull(commonsPlus.getStandardDeviationCowsPerFarmer());
    }

}
