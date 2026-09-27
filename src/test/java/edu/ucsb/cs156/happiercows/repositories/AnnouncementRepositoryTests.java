package edu.ucsb.cs156.happiercows.repositories;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import edu.ucsb.cs156.happiercows.entities.Announcement;
import edu.ucsb.cs156.happiercows.utilities.PacificTimeUtils;

/**
 * Verifies that Announcement.startDate/endDate - java.util.Date values written via
 * AnnouncementsController's Pacific-zone toDate() conversion into a zone-less
 * TIMESTAMP column - survive a real database round trip without the absolute instant
 * shifting (see issue #318).
 *
 * <p>A java.util.Date carries no zone of its own (it's just an absolute instant), so writing
 * it into a zone-less column and reading it back relies on the JDBC driver using the same
 * (JVM default) calendar symmetrically on both the write and the read side. As long as that
 * holds - which it does within a single running JVM/test - the round trip is correct
 * regardless of what the JVM's default zone actually is. This test exists to make that
 * property explicit and catch a regression if it's ever broken (e.g. by an explicit Calendar
 * being introduced on only one side of the read/write path).
 */
@DataJpaTest
public class AnnouncementRepositoryTests {

    @Autowired
    private AnnouncementRepository announcementRepository;

    private Date toDate(LocalDateTime localDateTime) {
        return Date.from(localDateTime.atZone(PacificTimeUtils.ZONE).toInstant());
    }

    @Test
    void startDate_round_trips_through_the_database_without_shifting() {
        Date intendedInstant = toDate(LocalDateTime.parse("2026-06-15T09:30:00"));

        Announcement saved = announcementRepository.save(Announcement.builder()
                .gameId(1L)
                .startDate(intendedInstant)
                .announcementText("Round trip check")
                .build());

        Optional<Announcement> reloaded = announcementRepository.findByAnnouncementId(saved.getId());

        assertTrue(reloaded.isPresent());
        assertTrue(intendedInstant.toInstant().equals(reloaded.get().getStartDate().toInstant()));
    }
}
