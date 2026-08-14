package edu.ucsb.cs156.happiercows.services;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.entities.FarmerActivity;
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.Student;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.repositories.FarmerActivityRepository;

/**
 * Records FarmerActivity rows (play-page views, buy/sell actions) for
 * course-linked games whose farmer's email matches a student on that
 * course's roster. See issue #291.
 */
@Service
public class FarmerActivityService {

    // The server's JVM default timezone isn't guaranteed to be Pacific (it's
    // commonly UTC in a deployed container), and FarmerActivity.timestamp is
    // a LocalDateTime with no zone of its own, so the wall-clock value has
    // to be computed in the right zone explicitly - matching the convention
    // already used for announcements/CSV exports elsewhere in this app.
    private static final ZoneId LOCAL_TIME_ZONE = ZoneId.of("America/Los_Angeles");

    @Autowired
    private CourseAccessService courseAccessService;

    @Autowired
    private FarmerActivityRepository farmerActivityRepository;

    /**
     * Records a FarmerActivity row for the given user/game/farmer/activityType,
     * but only if the game is linked to a course and the user's email matches
     * a student on that course's roster. Silently does nothing otherwise:
     * tracking is opt-in-by-roster-membership, not an error condition when
     * it doesn't apply (e.g. a standalone game with no course, or a course
     * staff member rather than a student).
     */
    public void recordActivityIfStudentMatch(
            User user, Game game, Farmer farmer, int activityType, int numCows) {
        Optional<Student> matchingStudent =
                courseAccessService.findMatchingStudentForCourseLinkedGame(user, game);
        if (matchingStudent.isEmpty()) {
            return;
        }

        FarmerActivity activity = FarmerActivity.builder()
                .farmer(farmer)
                .studentId(matchingStudent.get().getId())
                .timestamp(LocalDateTime.now(LOCAL_TIME_ZONE))
                .activityType(activityType)
                .numCows(numCows)
                .build();

        farmerActivityRepository.save(activity);
    }
}
