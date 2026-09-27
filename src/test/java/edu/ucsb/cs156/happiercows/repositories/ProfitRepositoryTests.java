package edu.ucsb.cs156.happiercows.repositories;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.Profit;
import edu.ucsb.cs156.happiercows.entities.User;

/**
 * Verifies findAllByFarmer_GameAndTimestampGreaterThanEqualAndTimestampLessThan against a real
 * database (see issue #318). A mocked repository can't catch a typo in a Spring Data derived
 * query's method name, or a wrong assumption about whether the range is inclusive/exclusive at
 * each end - only running the actual generated query can (see issue #292's identical bug in
 * FarmerActivityRepository, caused by the Between keyword being inclusive on both ends).
 */
@DataJpaTest
public class ProfitRepositoryTests {

    @Autowired
    private ProfitRepository profitRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    private Farmer farmer;
    private Game otherGame;
    private Farmer otherGameFarmer;

    @BeforeEach
    void setUp() {
        User user = userRepository.save(User.builder().email("student@ucsb.edu").build());
        Game game = gameRepository.save(Game.builder().name("test game").lastDate(LocalDateTime.now()).build());
        farmer = farmerRepository.save(Farmer.builder().user(user).game(game).username("student").build());

        User otherUser = userRepository.save(User.builder().email("other@ucsb.edu").build());
        otherGame = gameRepository.save(Game.builder().name("other game").lastDate(LocalDateTime.now()).build());
        otherGameFarmer = farmerRepository.save(
                Farmer.builder().user(otherUser).game(otherGame).username("other").build());
    }

    private Profit save(Farmer f, String timestamp) {
        return profitRepository.save(Profit.builder()
                .farmer(f)
                .amount(1.0)
                .timestamp(LocalDateTime.parse(timestamp))
                .numCows(1)
                .avgCowHealth(100)
                .build());
    }

    @Test
    void finds_profit_within_range_for_the_given_game() {
        Profit inRange1 = save(farmer, "2026-01-05T12:00:00");
        Profit inRange2 = save(farmer, "2026-01-06T08:00:00");
        save(otherGameFarmer, "2026-01-05T12:00:00"); // right time, wrong game - excluded below

        List<Profit> results = profitRepository
                .findAllByFarmer_GameAndTimestampGreaterThanEqualAndTimestampLessThan(
                        farmer.getGame(),
                        LocalDateTime.parse("2026-01-01T00:00:00"), LocalDateTime.parse("2026-01-11T00:00:00"));

        assertEquals(2, results.size());
        assertTrue(results.stream().anyMatch(p -> p.getId() == inRange1.getId()));
        assertTrue(results.stream().anyMatch(p -> p.getId() == inRange2.getId()));
    }

    @Test
    void excludes_profit_for_a_different_game() {
        save(otherGameFarmer, "2026-01-05T12:00:00");

        List<Profit> results = profitRepository
                .findAllByFarmer_GameAndTimestampGreaterThanEqualAndTimestampLessThan(
                        farmer.getGame(),
                        LocalDateTime.parse("2026-01-01T00:00:00"), LocalDateTime.parse("2026-01-11T00:00:00"));

        assertEquals(0, results.size());
    }

    @Test
    void start_of_range_is_inclusive() {
        save(farmer, "2026-01-01T00:00:00");

        List<Profit> results = profitRepository
                .findAllByFarmer_GameAndTimestampGreaterThanEqualAndTimestampLessThan(
                        farmer.getGame(),
                        LocalDateTime.parse("2026-01-01T00:00:00"), LocalDateTime.parse("2026-01-11T00:00:00"));

        assertEquals(1, results.size());
    }

    @Test
    void end_of_range_is_exclusive() {
        save(farmer, "2026-01-11T00:00:00");

        List<Profit> results = profitRepository
                .findAllByFarmer_GameAndTimestampGreaterThanEqualAndTimestampLessThan(
                        farmer.getGame(),
                        LocalDateTime.parse("2026-01-01T00:00:00"), LocalDateTime.parse("2026-01-11T00:00:00"));

        assertEquals(0, results.size());
    }

    @Test
    void excludes_profit_before_the_range() {
        save(farmer, "2025-12-31T23:59:59");

        List<Profit> results = profitRepository
                .findAllByFarmer_GameAndTimestampGreaterThanEqualAndTimestampLessThan(
                        farmer.getGame(),
                        LocalDateTime.parse("2026-01-01T00:00:00"), LocalDateTime.parse("2026-01-11T00:00:00"));

        assertEquals(0, results.size());
    }
}
