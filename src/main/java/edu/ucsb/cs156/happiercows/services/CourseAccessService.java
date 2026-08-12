package edu.ucsb.cs156.happiercows.services;

import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.Staff;
import edu.ucsb.cs156.happiercows.entities.Student;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.repositories.StaffRepository;
import edu.ucsb.cs156.happiercows.repositories.StudentRepository;
import edu.ucsb.cs156.happiercows.utilities.CanonicalFormConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Determines whether a user has access to a course-linked Game, based on
 * whether their email appears on the roster (as a Student or Staff member)
 * of the course the Game is linked to. See issue #251.
 */
@Service
public class CourseAccessService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StaffRepository staffRepository;

    /**
     * A user is eligible for a course-linked game if they are an admin, or
     * if their email appears on the course's roster of students or staff.
     * A game with no course (courseId == null) is open to everyone.
     */
    public boolean isEligibleForGame(User user, Game game) {
        if (game.getCourseId() == null) {
            return true;
        }
        if (user.isAdmin()) {
            return true;
        }
        return getCourseIdsForUser(user).contains(game.getCourseId());
    }

    /**
     * Returns the distinct list of course ids for which this user's email
     * appears on the roster as a student or as staff.
     *
     * <p>Roster emails are compared to the user's email using
     * {@link CanonicalFormConverter#areEquivalentEmails}, not exact string
     * equality, so that a roster row uploaded with a stale/non-canonical
     * email (e.g. an old {@code @umail.ucsb.edu} entry that predates this
     * fix, or one that slips in from a school whose export format isn't
     * fully normalized) still matches a student logging in with the
     * canonical form of the same address. See issue #278.
     */
    public List<Long> getCourseIdsForUser(User user) {
        List<Long> courseIds = new ArrayList<>();
        String email = user.getEmail();

        for (Student student : studentRepository.findAll()) {
            if (student.getCourseId() != null
                    && !courseIds.contains(student.getCourseId())
                    && CanonicalFormConverter.areEquivalentEmails(student.getEmail(), email)) {
                courseIds.add(student.getCourseId());
            }
        }

        for (Staff staff : staffRepository.findAll()) {
            if (staff.getCourseId() != null
                    && !courseIds.contains(staff.getCourseId())
                    && CanonicalFormConverter.areEquivalentEmails(staff.getEmail(), email)) {
                courseIds.add(staff.getCourseId());
            }
        }

        return courseIds;
    }
}
