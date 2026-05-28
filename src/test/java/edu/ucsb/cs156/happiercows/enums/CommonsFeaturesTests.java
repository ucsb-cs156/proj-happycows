package edu.ucsb.cs156.happiercows.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CommonsFeaturesTests {

    @Test
    public void testIsValidFeature_returns_true_for_known_feature() {
        assertTrue(CommonsFeatures.isValidFeature("FARMERS_CAN_SEE_LEADERBOARD"));
    }

    @Test
    public void testIsValidFeature_returns_false_for_unknown_feature() {
        assertFalse(CommonsFeatures.isValidFeature("UNKNOWN_FEATURE"));
    }
}
