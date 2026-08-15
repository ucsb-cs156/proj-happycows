package edu.ucsb.cs156.happiercows.entities;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

public class ReportTests {

    @Test
    void test_getEffectiveCapacity_with_lower_per_user() throws Exception {
        Report report = Report.builder()
                .capacityPerUser(5)
                .carryingCapacity(10)
                .numUsers(1)
                .build();

        assertEquals(10, report.getEffectiveCapacity());
    }

    @Test
    void test_getEffectiveCapacity_with_higher_per_user() throws Exception {
        Report report = Report.builder()
                .capacityPerUser(50)
                .carryingCapacity(10)
                .numUsers(2)
                .build();

        assertEquals(100, report.getEffectiveCapacity());
    }
}
