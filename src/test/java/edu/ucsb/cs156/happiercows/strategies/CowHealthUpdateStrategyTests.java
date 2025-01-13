package edu.ucsb.cs156.happiercows.strategies;

import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.CommonsPlus;
import edu.ucsb.cs156.happiercows.entities.UserCommons;
import edu.ucsb.cs156.happiercows.services.CommonsPlusBuilderService;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(SpringExtension.class)
@ContextConfiguration
class CowHealthUpdateStrategyTests {

    Commons commons = Commons.builder()
            .degradationRate(0.01)
            .capacityPerUser(20)
            .carryingCapacity(100)
            .build();
    UserCommons uc = UserCommons.builder().cowHealth(50).build();

    CommonsPlus commonsPlus = CommonsPlus.builder().commons(commons).totalUsers(1).build();

    Commons commons1 = Commons.builder()
            .degradationRate(1.0)
            .capacityPerUser(1)
            .carryingCapacity(1000)
            .build();
    UserCommons uc1 = UserCommons.builder().cowHealth(50).build();

    CommonsPlus commonsPlus1 = CommonsPlus.builder().commons(commons1).totalUsers(1).build();

    Commons commons2 = Commons.builder()
            .degradationRate(2.0)
            .capacityPerUser(1)
            .carryingCapacity(1000)
            .build();
    UserCommons uc2 = UserCommons.builder().cowHealth(50).build();

    CommonsPlus commonsPlus2 = CommonsPlus.builder().commons(commons2).totalUsers(1).build();

    Commons commons0_5 = Commons.builder()
            .degradationRate(0.5)
            .capacityPerUser(1)
            .carryingCapacity(1000)
            .build();
    UserCommons uc0_5 = UserCommons.builder().cowHealth(50).build();

    CommonsPlus commonsPlus0_5 = CommonsPlus.builder().commons(commons0_5).totalUsers(1).build();

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

        assertEquals(49.9, formula.calculateNewCowHealth(commonsPlus, uc, 110));
        assertEquals(50.0, formula.calculateNewCowHealth(commonsPlus, uc, 100));
        assertEquals(50.1, formula.calculateNewCowHealth(commonsPlus, uc, 90));
    }

    @Test
    void constant_changes_by_constant_amount() {
        var formula = CowHealthUpdateStrategies.Constant;

        assertEquals(49.99, formula.calculateNewCowHealth(commonsPlus, uc, 120));
        assertEquals(49.99, formula.calculateNewCowHealth(commonsPlus, uc, 110));
        assertEquals(50.01, formula.calculateNewCowHealth(commonsPlus, uc, 100));
        assertEquals(50.01, formula.calculateNewCowHealth(commonsPlus, uc, 90));
    }

    @Test
    void noop_does_nothing() {
        var formula = CowHealthUpdateStrategies.Noop;

        assertEquals(50.0, formula.calculateNewCowHealth(commonsPlus, uc, 110));
        assertEquals(50.0, formula.calculateNewCowHealth(commonsPlus, uc, 100));
        assertEquals(50.0, formula.calculateNewCowHealth(commonsPlus, uc, 90));
    }

    @Test
    void milan_calculates_correctly() {
        var formula = CowHealthUpdateStrategies.Milan;
        assertEquals(62.5, formula.calculateNewCowHealth(commonsPlus1, uc1, 500));
        assertEquals(50.0, formula.calculateNewCowHealth(commonsPlus1, uc1, 1000));
        assertEquals(0.0, formula.calculateNewCowHealth(commonsPlus1, uc1, 2000));
    }

    @Test
    void mattanhah_calculates_correctly() {
        var formula = CowHealthUpdateStrategies.Mattanjah;
        double tolerance = 1E-12;

        assertEquals(62.5, formula.calculateNewCowHealth(commonsPlus1, uc1, 500));
        assertEquals(50.0, formula.calculateNewCowHealth(commonsPlus1, uc1, 1000));
        assertEquals(0.0, formula.calculateNewCowHealth(commonsPlus1, uc1, 2000));

        assertEquals(100.0, formula.calculateNewCowHealth(commonsPlus2, uc2, 500));
        assertEquals(62.5, formula.calculateNewCowHealth(commonsPlus2, uc2, 750));
        assertEquals(50.0, formula.calculateNewCowHealth(commonsPlus2, uc2, 1000));
        assertEquals(37.5, formula.calculateNewCowHealth(commonsPlus2, uc2, 1250));
        assertEquals(0.0, formula.calculateNewCowHealth(commonsPlus2, uc2, 1500));

        assertEquals(60.125, formula.calculateNewCowHealth(commonsPlus0_5, uc0_5, 100), tolerance);
        assertEquals(53.125, formula.calculateNewCowHealth(commonsPlus0_5, uc0_5, 500), tolerance);
        assertEquals(50.0, formula.calculateNewCowHealth(commonsPlus0_5, uc0_5, 1000), tolerance);
        assertEquals(37.5, formula.calculateNewCowHealth(commonsPlus0_5, uc0_5, 2000), tolerance);
        assertEquals(0.0, formula.calculateNewCowHealth(commonsPlus0_5, uc0_5, 3000), tolerance);

    }
}
