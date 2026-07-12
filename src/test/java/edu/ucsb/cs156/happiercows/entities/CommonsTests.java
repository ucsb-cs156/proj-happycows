package edu.ucsb.cs156.happiercows.entities;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

public class CommonsTests {
    LocalDateTime start = LocalDateTime.parse("2020-01-21T06:47:22.756");
    LocalDateTime start2 = LocalDateTime.parse("2100-03-05T15:50:10");
    LocalDateTime end = LocalDateTime.parse("2200-01-21T06:47:22.756");
    LocalDateTime end2 = LocalDateTime.parse("2021-03-05T15:50:10");

    // For the parameterized versions, use a game with a start date of
    // 2024-01-10 (with a time of day of 14:30) and a last date of
    // 2024-01-20 (with a time of day of 09:15).  The game is in progress
    // strictly after 2024-01-10T00:00 and strictly before 2024-01-20T00:00.
    Commons game = Commons.builder()
            .startingDate(LocalDateTime.parse("2024-01-10T14:30:00"))
            .lastDate(LocalDateTime.parse("2024-01-20T09:15:00"))
            .build();

    @Test
    void test_gameInProgress_true() throws Exception {
        assertEquals(true, Commons.builder().startingDate(start).lastDate(end).build().gameInProgress());
    }
    @Test
    void test_gameInProgress_not_started() throws Exception {
        assertEquals(false, Commons.builder().startingDate(start2).lastDate(end).build().gameInProgress());
    }
    @Test
    void test_gameInProgress_ended() throws Exception {
        assertEquals(false, Commons.builder().startingDate(start).lastDate(end2).build().gameInProgress());
    }

    @Test
    void test_gameInProgress_false_before_start_date() throws Exception {
        assertEquals(false, game.gameInProgress(LocalDateTime.parse("2024-01-09T23:59:59")));
    }

    @Test
    void test_gameInProgress_false_exactly_at_midnight_on_start_date() throws Exception {
        assertEquals(false, game.gameInProgress(LocalDateTime.parse("2024-01-10T00:00:00")));
    }

    @Test
    void test_gameInProgress_true_just_after_midnight_on_start_date() throws Exception {
        // note: 00:00:01 on the start date is before the 14:30 time of day
        // stored in startingDate; only the date portion matters
        assertEquals(true, game.gameInProgress(LocalDateTime.parse("2024-01-10T00:00:01")));
    }

    @Test
    void test_gameInProgress_true_in_the_middle_of_the_game() throws Exception {
        assertEquals(true, game.gameInProgress(LocalDateTime.parse("2024-01-15T12:00:00")));
    }

    @Test
    void test_gameInProgress_true_just_before_midnight_on_last_date() throws Exception {
        assertEquals(true, game.gameInProgress(LocalDateTime.parse("2024-01-19T23:59:59")));
    }

    @Test
    void test_gameInProgress_false_exactly_at_midnight_on_last_date() throws Exception {
        assertEquals(false, game.gameInProgress(LocalDateTime.parse("2024-01-20T00:00:00")));
    }

    @Test
    void test_gameInProgress_false_after_last_date() throws Exception {
        assertEquals(false, game.gameInProgress(LocalDateTime.parse("2024-01-21T12:00:00")));
    }

    @Test
    void test_endDateHasPassed_false_before_midnight_on_last_date() throws Exception {
        assertEquals(false, game.endDateHasPassed(LocalDateTime.parse("2024-01-19T23:59:59")));
    }

    @Test
    void test_endDateHasPassed_true_exactly_at_midnight_on_last_date() throws Exception {
        assertEquals(true, game.endDateHasPassed(LocalDateTime.parse("2024-01-20T00:00:00")));
    }

    @Test
    void test_endDateHasPassed_true_after_last_date() throws Exception {
        assertEquals(true, game.endDateHasPassed(LocalDateTime.parse("2024-02-01T12:00:00")));
    }
}
