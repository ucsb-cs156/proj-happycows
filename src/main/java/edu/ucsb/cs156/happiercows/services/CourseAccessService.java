package edu.ucsb.cs156.happiercows.services;

import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.Staff;
import edu.ucsb.cs156.happiercows.entities.Student;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.repositories.StaffRepository;
import edu.ucsb.cs156.happiercows.repositories.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Determines whether a user has access to a course-linked Commons, based on
 * whether their email appears on the roster (as a Student or Staff member)
 * of the course the Commons is linked to. See issue #251.
 */
@Service
public class CourseAccessService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StaffRepository staffRepository;

    /**
     * A user is eligible for a course-linked commons if they are an admin, or
     * if their email appears on the course's roster of students or staff.
     * A commons with no course (courseId == null) is open to everyone.
     */
    public boolean isEligibleForCommons(User user, Commons commons) {
        if (commons.getCourseId() == null) {
            return true;
        }
        if (user.isAdmin()) {
            return true;
        }
        return getCourseIdsForUser(user).contains(commons.getCourseId());
    }

    /**
     * Returns the distinct list of course ids for which this user's email
     * appears on the roster as a student or as staff.
     */
    public List<Long> getCourseIdsForUser(User user) {
        List<Long> courseIds = new ArrayList<>();
        String email = user.getEmail();

        for (Student student : studentRepository.findByEmail(email)) {
            if (student.getCourseId() != null && !courseIds.contains(student.getCourseId())) {
                courseIds.add(student.getCourseId());
            }
        }

        for (Staff staff : staffRepository.findByEmail(email)) {
            if (staff.getCourseId() != null && !courseIds.contains(staff.getCourseId())) {
                courseIds.add(staff.getCourseId());
            }
        }

        return courseIds;
    }
}
