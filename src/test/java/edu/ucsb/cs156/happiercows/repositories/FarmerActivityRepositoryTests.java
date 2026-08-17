package edu.ucsb.cs156.happiercows.repositories;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.entities.FarmerActivity;
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.Student;
import edu.ucsb.cs156.happiercows.entities.User;

/**
 * Verifies findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan against a real database (see
 * issue #292). A @WebMvcTest with a mocked repository can't catch a typo in
 * a Spring Data derived query's method name, or a wrong assumption about
 * whether the range is inclusive/exclusive at each end - only running the
 * actual generated query can.
 */
@DataJpaTest
public class FarmerActivityRepositoryTests {

    @Autowired
    private FarmerActivityRepository farmerActivityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private StudentRepository studentRepository;

    private Farmer farmer;
    private long student1Id;
    private long student2Id;
    private long student3Id;

    // FarmerActivity.farmer's composite (user_id, game_id) FK columns and
    // its student_id column are both NOT NULL FKs, so a real User/Game/
    // Farmer/Student must exist for any row to save.
    @BeforeEach
    void setUp() {
        User user = userRepository.save(User.builder().email("student@ucsb.edu").build());
        Game game = gameRepository.save(Game.builder().name("test game").lastDate(LocalDateTime.now()).build());
        farmer = farmerRepository.save(Farmer.builder().user(user).game(game).username("student").build());

        student1Id = studentRepository.save(Student.builder().perm("0000001").build()).getId();
        student2Id = studentRepository.save(Student.builder().perm("0000002").build()).getId();
        student3Id = studentRepository.save(Student.builder().perm("0000003").build()).getId();
    }

    private FarmerActivity save(long studentId, String timestamp) {
        return farmerActivityRepository.save(FarmerActivity.builder()
                .farmer(farmer)
                .studentId(studentId)
                .timestamp(LocalDateTime.parse(timestamp))
                .activityType(FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW)
                .numCows(1)
                .build());
    }

    @Test
    void finds_activity_within_range_for_the_given_student_ids() {
        FarmerActivity inRangeStudent1 = save(student1Id, "2026-01-05T12:00:00");
        FarmerActivity inRangeStudent2 = save(student2Id, "2026-01-06T08:00:00");
        save(student3Id, "2026-01-05T12:00:00"); // right time, wrong student id - excluded below

        List<FarmerActivity> results = farmerActivityRepository
                .findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                        List.of(student1Id, student2Id),
                        LocalDateTime.parse("2026-01-01T00:00:00"), LocalDateTime.parse("2026-01-11T00:00:00"));

        assertEquals(2, results.size());
        assertTrue(results.stream().anyMatch(a -> a.getId() == inRangeStudent1.getId()));
        assertTrue(results.stream().anyMatch(a -> a.getId() == inRangeStudent2.getId()));
    }

    @Test
    void excludes_activity_for_a_student_id_not_in_the_given_collection() {
        save(student1Id, "2026-01-05T12:00:00");

        List<FarmerActivity> results = farmerActivityRepository
                .findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                        List.of(student2Id),
                        LocalDateTime.parse("2026-01-01T00:00:00"), LocalDateTime.parse("2026-01-11T00:00:00"));

        assertEquals(0, results.size());
    }

    @Test
    void start_of_range_is_inclusive() {
        save(student1Id, "2026-01-01T00:00:00");

        List<FarmerActivity> results = farmerActivityRepository
                .findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                        List.of(student1Id),
                        LocalDateTime.parse("2026-01-01T00:00:00"), LocalDateTime.parse("2026-01-11T00:00:00"));

        assertEquals(1, results.size());
    }

    @Test
    void end_of_range_is_exclusive() {
        save(student1Id, "2026-01-11T00:00:00");

        List<FarmerActivity> results = farmerActivityRepository
                .findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                        List.of(student1Id),
                        LocalDateTime.parse("2026-01-01T00:00:00"), LocalDateTime.parse("2026-01-11T00:00:00"));

        assertEquals(0, results.size());
    }

    @Test
    void excludes_activity_before_the_range() {
        save(student1Id, "2025-12-31T23:59:59");

        List<FarmerActivity> results = farmerActivityRepository
                .findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                        List.of(student1Id),
                        LocalDateTime.parse("2026-01-01T00:00:00"), LocalDateTime.parse("2026-01-11T00:00:00"));

        assertEquals(0, results.size());
    }
}
