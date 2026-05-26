package edu.ucsb.cs156.happiercows.enums;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;

public class CommonsFeaturesTests {

    @Test
    public void features_contains_expected_value_leaderboard() {
        CommonsFeatures feature = CommonsFeatures.valueOf("FARMERS_CAN_SEE_LEADERBOARD");
        assertNotNull(feature);
        assertEquals(CommonsFeatures.FARMERS_CAN_SEE_LEADERBOARD, feature);
    }

    @Test
    public void features_values_has_single_entry_leaderboard() {
        CommonsFeatures[] values = CommonsFeatures.values();
        assertEquals(3, values.length);
        assertEquals(CommonsFeatures.FARMERS_CAN_SEE_LEADERBOARD, values[0]);
    }

    @Test
    public void features_contains_expected_value_herd_size_histogram() {
        CommonsFeatures feature = CommonsFeatures.valueOf("FARMERS_CAN_SEE_HERD_SIZE_HISTOGRAM");
        assertNotNull(feature);
        assertEquals(CommonsFeatures.FARMERS_CAN_SEE_HERD_SIZE_HISTOGRAM, feature);
    }

    @Test
    public void features_values_has_single_entry_herd_size_histogram() {
        CommonsFeatures[] values = CommonsFeatures.values();
        assertEquals(3, values.length);
        assertEquals(CommonsFeatures.FARMERS_CAN_SEE_HERD_SIZE_HISTOGRAM, values[1]);
    }

    @Test
    public void features_contains_expected_value_taxes() {
        CommonsFeatures feature = CommonsFeatures.valueOf("TAXES_ON_HERD_SIZE_ARE_ENABLED");
        assertNotNull(feature);
        assertEquals(CommonsFeatures.TAXES_ON_HERD_SIZE_ARE_ENABLED, feature);
    }

    @Test
    public void features_values_has_single_entry_taxes() {
        CommonsFeatures[] values = CommonsFeatures.values();
        assertEquals(3, values.length);
        assertEquals(CommonsFeatures.TAXES_ON_HERD_SIZE_ARE_ENABLED, values[2]);
    }
}

