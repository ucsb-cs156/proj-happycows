package edu.ucsb.cs156.happiercows.strategies;

import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.GamePlus;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.services.GamePlusBuilderService;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(SpringExtension.class)
@ContextConfiguration
class CowHealthUpdateStrategyTests {

    Game game = Game.builder()
            .degradationRate(0.01)
            .capacityPerUser(20)
            .carryingCapacity(100)
            .build();
    Farmer uc = Farmer.builder().cowHealth(50).build();

    GamePlus gamePlus = GamePlus.builder().game(game).totalUsers(1).build();

    Game game1 = Game.builder()
            .degradationRate(1.0)
            .capacityPerUser(1)
            .carryingCapacity(1000)
            .build();
    Farmer uc1 = Farmer.builder().cowHealth(50).build();

    GamePlus gamePlus1 = GamePlus.builder().game(game1).totalUsers(1).build();

    Game game2 = Game.builder()
            .degradationRate(2.0)
            .capacityPerUser(1)
            .carryingCapacity(1000)
            .build();
    Farmer uc2 = Farmer.builder().cowHealth(50).build();

    GamePlus gamePlus2 = GamePlus.builder().game(game2).totalUsers(1).build();

    Game game0_5 = Game.builder()
            .degradationRate(0.5)
            .capacityPerUser(1)
            .carryingCapacity(1000)
            .build();
    Farmer uc0_5 = Farmer.builder().cowHealth(50).build();

    GamePlus gamePlus0_5 = GamePlus.builder().game(game0_5).totalUsers(1).build();

    @Test
    void get_name_and_description() {
        assertEquals("Linear", CowHealthUpdateStrategies.Linear.name());
        assertEquals("Linear", CowHealthUpdateStrategies.Linear.getDisplayName());
        assertEquals(
                "Cow health increases/decreases proportionally to the number of cows over/under the carrying capacity.",
                CowHealthUpdateStrategies.Linear.getDescription());
    }

    @Test
    void linear_updates_health_proportional_to_num_cows_over_capacity() {
        var formula = CowHealthUpdateStrategies.Linear;

        assertEquals(49.9, formula.calculateNewCowHealth(gamePlus, uc, 110));
        assertEquals(50.0, formula.calculateNewCowHealth(gamePlus, uc, 100));
        assertEquals(50.1, formula.calculateNewCowHealth(gamePlus, uc, 90));
    }

    @Test
    void constant_changes_by_constant_amount() {
        var formula = CowHealthUpdateStrategies.Constant;

        assertEquals(49.99, formula.calculateNewCowHealth(gamePlus, uc, 120));
        assertEquals(49.99, formula.calculateNewCowHealth(gamePlus, uc, 110));
        assertEquals(50.01, formula.calculateNewCowHealth(gamePlus, uc, 100));
        assertEquals(50.01, formula.calculateNewCowHealth(gamePlus, uc, 90));
    }

    @Test
    void noop_does_nothing() {
        var formula = CowHealthUpdateStrategies.Noop;

        assertEquals(50.0, formula.calculateNewCowHealth(gamePlus, uc, 110));
        assertEquals(50.0, formula.calculateNewCowHealth(gamePlus, uc, 100));
        assertEquals(50.0, formula.calculateNewCowHealth(gamePlus, uc, 90));
    }

    @Test
    void milan_calculates_correctly() {
        var formula = CowHealthUpdateStrategies.Milan;
        assertEquals(62.5, formula.calculateNewCowHealth(gamePlus1, uc1, 500));
        assertEquals(50.0, formula.calculateNewCowHealth(gamePlus1, uc1, 1000));
        assertEquals(37.5, formula.calculateNewCowHealth(gamePlus1, uc1, 1500));
        assertEquals(0.0, formula.calculateNewCowHealth(gamePlus1, uc1, 2000));
    }

    @Test
    void mattanjah_calculates_correctly() {
        var formula = CowHealthUpdateStrategies.Mattanjah;
        double tolerance = 1E-12;

        assertEquals(62.5, formula.calculateNewCowHealth(gamePlus1, uc1, 500));
        assertEquals(50.0, formula.calculateNewCowHealth(gamePlus1, uc1, 1000));
        assertEquals(0.0, formula.calculateNewCowHealth(gamePlus1, uc1, 2000));

        assertEquals(100.0, formula.calculateNewCowHealth(gamePlus2, uc2, 500));
        assertEquals(62.5, formula.calculateNewCowHealth(gamePlus2, uc2, 750));
        assertEquals(50.0, formula.calculateNewCowHealth(gamePlus2, uc2, 1000));
        assertEquals(37.5, formula.calculateNewCowHealth(gamePlus2, uc2, 1250));
        assertEquals(0.0, formula.calculateNewCowHealth(gamePlus2, uc2, 1500));

        assertEquals(60.125, formula.calculateNewCowHealth(gamePlus0_5, uc0_5, 100), tolerance);
        assertEquals(53.125, formula.calculateNewCowHealth(gamePlus0_5, uc0_5, 500), tolerance);
        assertEquals(50.0, formula.calculateNewCowHealth(gamePlus0_5, uc0_5, 1000), tolerance);
        assertEquals(37.5, formula.calculateNewCowHealth(gamePlus0_5, uc0_5, 2000), tolerance);
        assertEquals(0.0, formula.calculateNewCowHealth(gamePlus0_5, uc0_5, 3000), tolerance);

    }
}
