package edu.ucsb.cs156.happiercows.enums;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

public class CommonsFeaturesTests {

    @Test
    void test_enum_values() {
        CommonsFeatures[] values = CommonsFeatures.values();

        assertEquals(1, values.length);
        assertEquals(CommonsFeatures.FARMERS_CAN_SEE_LEADERBOARD, CommonsFeatures.valueOf("FARMERS_CAN_SEE_LEADERBOARD"));
    }
}