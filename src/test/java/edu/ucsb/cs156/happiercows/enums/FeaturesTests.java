package edu.ucsb.cs156.happiercows.enums;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;

public class FeaturesTests {

    @Test
    public void features_contains_expected_value() {
        Features feature = Features.valueOf("FARMERS_CAN_SEE_LEADERBOARD");
        assertNotNull(feature);
        assertEquals(Features.FARMERS_CAN_SEE_LEADERBOARD, feature);
    }

    @Test
    public void features_values_has_single_entry() {
        Features[] values = Features.values();
        assertEquals(1, values.length);
        assertEquals(Features.FARMERS_CAN_SEE_LEADERBOARD, values[0]);
    }
}

