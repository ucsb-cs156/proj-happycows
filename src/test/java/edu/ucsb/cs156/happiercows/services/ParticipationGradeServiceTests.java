package edu.ucsb.cs156.happiercows.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import edu.ucsb.cs156.happiercows.entities.Course;
import edu.ucsb.cs156.happiercows.entities.FarmerActivity;
import edu.ucsb.cs156.happiercows.entities.Student;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.models.ParticipationGrade;
import edu.ucsb.cs156.happiercows.models.ParticipationGradeParams;
import edu.ucsb.cs156.happiercows.repositories.CourseRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerActivityRepository;
import edu.ucsb.cs156.happiercows.repositories.StudentRepository;

@ExtendWith(SpringExtension.class)
@Import(ParticipationGradeService.class)
@ContextConfiguration
public class ParticipationGradeServiceTests {

    @MockBean
    CourseRepository courseRepository;

    @MockBean
    StudentRepository studentRepository;

    @MockBean
    FarmerActivityRepository farmerActivityRepository;

    @Autowired
    ParticipationGradeService participationGradeService;

    private final Course course = Course.builder().id(1L).code("CS156").name("Adv App Prog").term("W26").build();

    private final Student student1 =
            Student.builder().id(10L).courseId(1L).perm("1111111").lastName("Gaucho").firstMiddleName("Chris").build();

    private final Student student2 =
            Student.builder().id(20L).courseId(1L).perm("2222222").lastName("Delgado").firstMiddleName("Jamie").build();

    private final LocalDate startDate = LocalDate.parse("2026-01-01");
    private final LocalDate endDate = LocalDate.parse("2026-01-10"); // 10-day period

    private ParticipationGradeParams.ParticipationGradeParamsBuilder baseParams() {
        return ParticipationGradeParams.builder()
                .courseId(1L)
                .startDate(startDate)
                .endDate(endDate)
                .criterion1Weight(40)
                .criterion2Weight(40)
                .criterion2MinDays(5)
                .criterion2PartialCredit(false)
                .criterion3Weight(20)
                .totalPoints(100);
    }

    private FarmerActivity activity(long studentId, String date, int activityType, int numCows) {
        return FarmerActivity.builder()
                .studentId(studentId)
                .timestamp(LocalDate.parse(date).atTime(12, 0))
                .activityType(activityType)
                .numCows(numCows)
                .build();
    }

    @Test
    public void throws_when_course_not_found() {
        when(courseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> participationGradeService.computeGrades(baseParams().build()));
    }

    @Test
    public void throws_when_endDate_before_startDate() {
        ParticipationGradeParams params = baseParams()
                .startDate(LocalDate.parse("2026-01-10"))
                .endDate(LocalDate.parse("2026-01-01"))
                .build();

        Exception e = assertThrows(IllegalArgumentException.class,
                () -> participationGradeService.computeGrades(params));
        assertEquals("endDate must not be before startDate", e.getMessage());
    }

    @Test
    public void throws_when_weights_do_not_sum_to_100() {
        ParticipationGradeParams params = baseParams().criterion1Weight(50).build();

        Exception e = assertThrows(IllegalArgumentException.class,
                () -> participationGradeService.computeGrades(params));
        assertEquals("criterion weights must sum to 100, but sum to 110", e.getMessage());
    }

    @Test
    public void throws_when_criterion2MinDays_is_less_than_1() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        ParticipationGradeParams params = baseParams().criterion2MinDays(0).build();

        Exception e = assertThrows(IllegalArgumentException.class,
                () -> participationGradeService.computeGrades(params));
        assertEquals("criterion2MinDays must be between 1 and 10 (the number of days in the period)",
                e.getMessage());
    }

    @Test
    public void throws_when_criterion2MinDays_exceeds_days_in_period() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        ParticipationGradeParams params = baseParams().criterion2MinDays(11).build();

        Exception e = assertThrows(IllegalArgumentException.class,
                () -> participationGradeService.computeGrades(params));
        assertEquals("criterion2MinDays must be between 1 and 10 (the number of days in the period)",
                e.getMessage());
    }

    @Test
    public void accepts_criterion2MinDays_of_exactly_1_the_lower_boundary() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of());

        ParticipationGradeParams params = baseParams().criterion2MinDays(1).build();

        List<ParticipationGrade> grades = participationGradeService.computeGrades(params);
        assertTrue(grades.isEmpty());
    }

    @Test
    public void accepts_criterion2MinDays_equal_to_days_in_period_the_upper_boundary() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of());

        ParticipationGradeParams params = baseParams().criterion2MinDays(10).build();

        List<ParticipationGrade> grades = participationGradeService.computeGrades(params);
        assertTrue(grades.isEmpty());
    }

    @Test
    public void does_not_validate_criterion2MinDays_when_criterion2_is_disabled() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of());

        // criterion2Weight is 0, so criterion2MinDays being out of range must not throw;
        // criterion1/3 pick up the other 100%.
        ParticipationGradeParams params = baseParams()
                .criterion1Weight(80).criterion2Weight(0).criterion2MinDays(999).criterion3Weight(20)
                .build();

        List<ParticipationGrade> grades = participationGradeService.computeGrades(params);
        assertTrue(grades.isEmpty());
    }

    @Test
    public void returns_empty_list_when_course_has_no_students() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of());

        List<ParticipationGrade> grades = participationGradeService.computeGrades(baseParams().build());

        assertTrue(grades.isEmpty());
    }

    @Test
    public void gives_zero_credit_to_a_student_with_no_activity() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of(student1));
        when(farmerActivityRepository.findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                anyCollection(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of());

        List<ParticipationGrade> grades = participationGradeService.computeGrades(baseParams().build());

        assertEquals(1, grades.size());
        ParticipationGrade grade = grades.get(0);
        assertEquals(10L, grade.getStudentId());
        assertEquals("1111111", grade.getPerm());
        assertEquals("Gaucho", grade.getLastName());
        assertEquals("Chris", grade.getFirstMiddleName());
        assertFalse(grade.isInteractedAtLeastOnce());
        assertEquals(0, grade.getDaysInteracted());
        assertFalse(grade.isOwnedAndCheckedInOnACow());
        assertEquals(0.0, grade.getTotalPointsEarned());
    }

    @Test
    public void queries_activity_using_the_rosters_student_ids_and_the_date_range_as_a_half_open_interval() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of(student1, student2));
        when(farmerActivityRepository.findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                anyCollection(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of());

        participationGradeService.computeGrades(baseParams().build());

        ArgumentCaptor<LocalDateTime> startCaptor = ArgumentCaptor.forClass(LocalDateTime.class);
        ArgumentCaptor<LocalDateTime> endCaptor = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(farmerActivityRepository)
                .findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                        eq(List.of(10L, 20L)), startCaptor.capture(), endCaptor.capture());

        assertEquals(LocalDateTime.parse("2026-01-01T00:00:00"), startCaptor.getValue());
        assertEquals(LocalDateTime.parse("2026-01-11T00:00:00"), endCaptor.getValue());
    }

    @Test
    public void criterion1_gives_full_credit_for_any_activity_in_range() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of(student1));
        when(farmerActivityRepository.findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                anyCollection(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(activity(10L, "2026-01-03", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0)));

        ParticipationGradeParams params = baseParams().criterion1Weight(100).criterion2Weight(0).criterion3Weight(0)
                .build();
        List<ParticipationGrade> grades = participationGradeService.computeGrades(params);

        assertTrue(grades.get(0).isInteractedAtLeastOnce());
        assertEquals(100.0, grades.get(0).getTotalPointsEarned());
    }

    @Test
    public void criterion1_is_disabled_when_its_weight_is_zero() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of(student1));
        when(farmerActivityRepository.findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                anyCollection(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(activity(10L, "2026-01-03", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0)));

        ParticipationGradeParams params = baseParams().criterion1Weight(0).criterion2Weight(0).criterion3Weight(100)
                .build();
        List<ParticipationGrade> grades = participationGradeService.computeGrades(params);

        assertEquals(0.0, grades.get(0).getCriterion1PointsEarned());
    }

    @Test
    public void criterion2_allOrNothing_gives_full_credit_when_daysInteracted_meets_minDays() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of(student1));
        when(farmerActivityRepository.findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                anyCollection(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(
                        activity(10L, "2026-01-01", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0),
                        activity(10L, "2026-01-02", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0),
                        activity(10L, "2026-01-03", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0),
                        activity(10L, "2026-01-04", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0),
                        activity(10L, "2026-01-05", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0)));

        ParticipationGradeParams params = baseParams()
                .criterion1Weight(0).criterion2Weight(100).criterion2MinDays(5).criterion2PartialCredit(false)
                .criterion3Weight(0)
                .build();
        List<ParticipationGrade> grades = participationGradeService.computeGrades(params);

        assertEquals(5, grades.get(0).getDaysInteracted());
        assertEquals(100.0, grades.get(0).getTotalPointsEarned());
    }

    @Test
    public void criterion2_allOrNothing_gives_zero_credit_when_daysInteracted_below_minDays() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of(student1));
        when(farmerActivityRepository.findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                anyCollection(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(
                        activity(10L, "2026-01-01", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0),
                        activity(10L, "2026-01-02", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0)));

        ParticipationGradeParams params = baseParams()
                .criterion1Weight(0).criterion2Weight(100).criterion2MinDays(5).criterion2PartialCredit(false)
                .criterion3Weight(0)
                .build();
        List<ParticipationGrade> grades = participationGradeService.computeGrades(params);

        assertEquals(2, grades.get(0).getDaysInteracted());
        assertEquals(0.0, grades.get(0).getTotalPointsEarned());
    }

    @Test
    public void criterion2_partialCredit_scales_with_daysInteracted() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of(student1));
        when(farmerActivityRepository.findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                anyCollection(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(
                        activity(10L, "2026-01-01", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0),
                        activity(10L, "2026-01-02", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0)));

        ParticipationGradeParams params = baseParams()
                .criterion1Weight(0).criterion2Weight(100).criterion2MinDays(5).criterion2PartialCredit(true)
                .criterion3Weight(0)
                .build();
        List<ParticipationGrade> grades = participationGradeService.computeGrades(params);

        // 2/5 of the 100-point criterion2 weight, scaled to a 100-point total => 40.0
        assertEquals(40.0, grades.get(0).getTotalPointsEarned());
    }

    @Test
    public void criterion2_partialCredit_is_capped_at_full_weight_when_daysInteracted_exceeds_minDays() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of(student1));
        when(farmerActivityRepository.findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                anyCollection(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(
                        activity(10L, "2026-01-01", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0),
                        activity(10L, "2026-01-02", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0),
                        activity(10L, "2026-01-03", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0),
                        activity(10L, "2026-01-04", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0),
                        activity(10L, "2026-01-05", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0),
                        activity(10L, "2026-01-06", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0),
                        activity(10L, "2026-01-07", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0),
                        activity(10L, "2026-01-08", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0),
                        activity(10L, "2026-01-09", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0),
                        activity(10L, "2026-01-10", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0)));

        ParticipationGradeParams params = baseParams()
                .criterion1Weight(0).criterion2Weight(100).criterion2MinDays(5).criterion2PartialCredit(true)
                .criterion3Weight(0)
                .build();
        List<ParticipationGrade> grades = participationGradeService.computeGrades(params);

        assertEquals(10, grades.get(0).getDaysInteracted());
        assertEquals(100.0, grades.get(0).getTotalPointsEarned());
    }

    @Test
    public void criterion3_is_true_for_a_pageview_with_at_least_one_cow() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of(student1));
        when(farmerActivityRepository.findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                anyCollection(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(activity(10L, "2026-01-03", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 3)));

        ParticipationGradeParams params = baseParams().criterion1Weight(0).criterion2Weight(0).criterion3Weight(100)
                .build();
        List<ParticipationGrade> grades = participationGradeService.computeGrades(params);

        assertTrue(grades.get(0).isOwnedAndCheckedInOnACow());
        assertEquals(100.0, grades.get(0).getTotalPointsEarned());
    }

    @Test
    public void criterion3_is_true_for_a_pageview_with_exactly_one_cow_the_boundary() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of(student1));
        when(farmerActivityRepository.findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                anyCollection(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(activity(10L, "2026-01-03", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 1)));

        ParticipationGradeParams params = baseParams().criterion1Weight(0).criterion2Weight(0).criterion3Weight(100)
                .build();
        List<ParticipationGrade> grades = participationGradeService.computeGrades(params);

        assertTrue(grades.get(0).isOwnedAndCheckedInOnACow());
    }

    @Test
    public void criterion3_is_false_for_a_pageview_with_zero_cows() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of(student1));
        when(farmerActivityRepository.findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                anyCollection(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(activity(10L, "2026-01-03", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0)));

        ParticipationGradeParams params = baseParams().criterion1Weight(0).criterion2Weight(0).criterion3Weight(100)
                .build();
        List<ParticipationGrade> grades = participationGradeService.computeGrades(params);

        assertFalse(grades.get(0).isOwnedAndCheckedInOnACow());
        assertEquals(0.0, grades.get(0).getTotalPointsEarned());
    }

    // This is the key regression test for issue #292's redefinition of
    // criterion 3: buying or selling cows is NOT, by itself, "checking in on
    // the farm while owning a cow" - only a PLAY_PAGE_VIEW row's numCows is a
    // snapshot of the actual herd size. A BUY/SELL row's numCows is a
    // transaction delta, and is deliberately not treated as proof of a
    // check-in.
    @Test
    public void criterion3_is_false_for_buy_and_sell_activity_with_no_pageview() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of(student1));
        when(farmerActivityRepository.findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                anyCollection(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(
                        activity(10L, "2026-01-03", FarmerActivity.ACTIVITY_TYPE_BUY, 5),
                        activity(10L, "2026-01-04", FarmerActivity.ACTIVITY_TYPE_SELL, 5)));

        ParticipationGradeParams params = baseParams().criterion1Weight(0).criterion2Weight(0).criterion3Weight(100)
                .build();
        List<ParticipationGrade> grades = participationGradeService.computeGrades(params);

        assertFalse(grades.get(0).isOwnedAndCheckedInOnACow());
        assertEquals(0.0, grades.get(0).getTotalPointsEarned());
    }

    @Test
    public void criterion3_is_disabled_when_its_weight_is_zero() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of(student1));
        when(farmerActivityRepository.findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                anyCollection(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(activity(10L, "2026-01-03", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 3)));

        ParticipationGradeParams params = baseParams().criterion1Weight(100).criterion2Weight(0).criterion3Weight(0)
                .build();
        List<ParticipationGrade> grades = participationGradeService.computeGrades(params);

        assertTrue(grades.get(0).isOwnedAndCheckedInOnACow());
        assertEquals(0.0, grades.get(0).getCriterion3PointsEarned());
    }

    @Test
    public void excludes_activity_outside_the_date_range() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of(student1));
        // Simulates the repository correctly filtering: activity strictly
        // before/after the range is never even returned to the service.
        when(farmerActivityRepository.findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                anyCollection(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of());

        List<ParticipationGrade> grades = participationGradeService.computeGrades(baseParams().build());

        assertFalse(grades.get(0).isInteractedAtLeastOnce());
    }

    @Test
    public void computes_independent_grades_for_multiple_students_in_the_same_course() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of(student1, student2));
        when(farmerActivityRepository.findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                anyCollection(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(activity(10L, "2026-01-03", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 1)));

        ParticipationGradeParams params = baseParams().criterion1Weight(100).criterion2Weight(0).criterion3Weight(0)
                .build();
        List<ParticipationGrade> grades = participationGradeService.computeGrades(params);

        assertEquals(2, grades.size());
        ParticipationGrade gradeForStudent1 = grades.stream().filter(g -> g.getStudentId() == 10L).findFirst().get();
        ParticipationGrade gradeForStudent2 = grades.stream().filter(g -> g.getStudentId() == 20L).findFirst().get();

        assertTrue(gradeForStudent1.isInteractedAtLeastOnce());
        assertFalse(gradeForStudent2.isInteractedAtLeastOnce());
    }

    @Test
    public void combines_all_three_criteria_into_a_weighted_total() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentRepository.findByCourseId(1L)).thenReturn(List.of(student1));
        when(farmerActivityRepository.findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                anyCollection(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(
                        // 3 distinct days of interaction, one of which is a qualifying pageview
                        activity(10L, "2026-01-01", FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 2),
                        activity(10L, "2026-01-02", FarmerActivity.ACTIVITY_TYPE_BUY, 1),
                        activity(10L, "2026-01-03", FarmerActivity.ACTIVITY_TYPE_SELL, 1)));

        // weights: 40 / 40 (n=5, partial) / 20, totalPoints=50
        ParticipationGradeParams params = baseParams().criterion2PartialCredit(true).totalPoints(50).build();
        List<ParticipationGrade> grades = participationGradeService.computeGrades(params);
        ParticipationGrade grade = grades.get(0);

        // criterion1: met -> 40% ; criterion2: 3/5 days -> 24% ; criterion3: met -> 20%
        // total percent = 84% of 50 points = 42.0
        assertEquals(20.0, grade.getCriterion1PointsEarned());
        assertEquals(12.0, grade.getCriterion2PointsEarned());
        assertEquals(10.0, grade.getCriterion3PointsEarned());
        assertEquals(42.0, grade.getTotalPointsEarned());
    }
}
