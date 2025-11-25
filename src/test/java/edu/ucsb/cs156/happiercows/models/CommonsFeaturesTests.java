package edu.ucsb.cs156.happiercows.models;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class CommonsFeaturesTests {

    @Test
    void testEnumValues() {
        CommonsFeatures[] values = CommonsFeatures.values();
        assertEquals(1, values.length);
        assertEquals(CommonsFeatures.FARMERS_CAN_SEE_LEADERBOARD, values[0]);
    }

    @Test
    void testValueOf() {
        CommonsFeatures feature = CommonsFeatures.valueOf("FARMERS_CAN_SEE_LEADERBOARD");
        assertNotNull(feature);
        assertEquals(CommonsFeatures.FARMERS_CAN_SEE_LEADERBOARD, feature);
    }

    @Test
    void testEnumName() {
        assertEquals("FARMERS_CAN_SEE_LEADERBOARD", CommonsFeatures.FARMERS_CAN_SEE_LEADERBOARD.name());
    }
}
