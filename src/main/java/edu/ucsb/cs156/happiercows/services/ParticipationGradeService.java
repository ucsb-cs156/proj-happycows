package edu.ucsb.cs156.happiercows.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.ucsb.cs156.happiercows.entities.Course;
import edu.ucsb.cs156.happiercows.entities.FarmerActivity;
import edu.ucsb.cs156.happiercows.entities.Student;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.models.ParticipationGrade;
import edu.ucsb.cs156.happiercows.models.ParticipationGradeParams;
import edu.ucsb.cs156.happiercows.repositories.CourseRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerActivityRepository;
import edu.ucsb.cs156.happiercows.repositories.StudentRepository;

// See issue #292. "Interacted" (criteria 1 and 2) is any FarmerActivity row
// in the date range, regardless of type. "Owned a cow" (criterion 3) is
// deliberately NOT "was there ever a BUY/SELL row" - it's redefined as
// "checked in on the farm while owning at least one cow", i.e. a
// PLAY_PAGE_VIEW row (the only activity type whose numCows field is a
// snapshot of the farmer's total herd, rather than a transaction delta)
// with numCows >= 1. This sidesteps needing the Profit table (whose
// timestamps aren't in Pacific time - see issue #318) and naturally
// excludes cows that died before ever being checked on.
@Service
public class ParticipationGradeService {

    @Autowired
    CourseRepository courseRepository;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    FarmerActivityRepository farmerActivityRepository;

    public List<ParticipationGrade> computeGrades(ParticipationGradeParams params) {
        validate(params);

        courseRepository.findById(params.getCourseId())
                .orElseThrow(() -> new EntityNotFoundException(Course.class, params.getCourseId()));

        List<Student> students = new ArrayList<>();
        studentRepository.findByCourseId(params.getCourseId()).forEach(students::add);

        List<Long> studentIds = students.stream().map(Student::getId).collect(Collectors.toList());

        LocalDateTime startInclusive = params.getStartDate().atStartOfDay();
        LocalDateTime endExclusive = params.getEndDate().plusDays(1).atStartOfDay();

        List<FarmerActivity> activities = studentIds.isEmpty()
                ? List.of()
                : farmerActivityRepository.findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
                        studentIds, startInclusive, endExclusive);

        Map<Long, List<FarmerActivity>> activitiesByStudentId = activities.stream()
                .collect(Collectors.groupingBy(FarmerActivity::getStudentId));

        return students.stream()
                .map(student -> computeGradeForStudent(
                        student, activitiesByStudentId.getOrDefault(student.getId(), List.of()), params))
                .collect(Collectors.toList());
    }

    private void validate(ParticipationGradeParams params) {
        if (params.getEndDate().isBefore(params.getStartDate())) {
            throw new IllegalArgumentException("endDate must not be before startDate");
        }

        int totalWeight = params.getCriterion1Weight() + params.getCriterion2Weight() + params.getCriterion3Weight();
        if (totalWeight != 100) {
            throw new IllegalArgumentException(
                    "criterion weights must sum to 100, but sum to %d".formatted(totalWeight));
        }

        if (params.getCriterion2Weight() > 0) {
            int daysInPeriod = daysInPeriod(params);
            if (params.getCriterion2MinDays() < 1 || params.getCriterion2MinDays() > daysInPeriod) {
                throw new IllegalArgumentException(
                        "criterion2MinDays must be between 1 and %d (the number of days in the period)"
                                .formatted(daysInPeriod));
            }
        }
    }

    private int daysInPeriod(ParticipationGradeParams params) {
        return (int) (ChronoUnit.DAYS.between(params.getStartDate(), params.getEndDate()) + 1);
    }

    private ParticipationGrade computeGradeForStudent(
            Student student, List<FarmerActivity> activities, ParticipationGradeParams params) {

        boolean interactedAtLeastOnce = !activities.isEmpty();

        Set<LocalDate> daysWithActivity = activities.stream()
                .map(activity -> activity.getTimestamp().toLocalDate())
                .collect(Collectors.toSet());
        int daysInteracted = daysWithActivity.size();

        boolean ownedAndCheckedInOnACow = activities.stream()
                .anyMatch(activity -> activity.getActivityType() == FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW
                        && activity.getNumCows() >= 1);

        double criterion1Percent = params.getCriterion1Weight() == 0
                ? 0
                : (interactedAtLeastOnce ? params.getCriterion1Weight() : 0);

        double criterion2Percent;
        if (params.getCriterion2Weight() == 0) {
            criterion2Percent = 0;
        } else if (params.isCriterion2PartialCredit()) {
            double fraction = Math.min(1.0, (double) daysInteracted / params.getCriterion2MinDays());
            criterion2Percent = fraction * params.getCriterion2Weight();
        } else {
            criterion2Percent = daysInteracted >= params.getCriterion2MinDays() ? params.getCriterion2Weight() : 0;
        }

        double criterion3Percent = params.getCriterion3Weight() == 0
                ? 0
                : (ownedAndCheckedInOnACow ? params.getCriterion3Weight() : 0);

        double criterion1Points = pointsFor(criterion1Percent, params.getTotalPoints());
        double criterion2Points = pointsFor(criterion2Percent, params.getTotalPoints());
        double criterion3Points = pointsFor(criterion3Percent, params.getTotalPoints());

        return ParticipationGrade.builder()
                .studentId(student.getId())
                .perm(student.getPerm())
                .lastName(student.getLastName())
                .firstMiddleName(student.getFirstMiddleName())
                .interactedAtLeastOnce(interactedAtLeastOnce)
                .daysInteracted(daysInteracted)
                .ownedAndCheckedInOnACow(ownedAndCheckedInOnACow)
                .criterion1PointsEarned(criterion1Points)
                .criterion2PointsEarned(criterion2Points)
                .criterion3PointsEarned(criterion3Points)
                .totalPointsEarned(round(criterion1Points + criterion2Points + criterion3Points))
                .build();
    }

    private double pointsFor(double percent, double totalPoints) {
        return round(percent / 100.0 * totalPoints);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
