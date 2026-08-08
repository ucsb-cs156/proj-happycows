package edu.ucsb.cs156.happiercows.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.Staff;
import edu.ucsb.cs156.happiercows.entities.Student;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.repositories.StaffRepository;
import edu.ucsb.cs156.happiercows.repositories.StudentRepository;

@ExtendWith(SpringExtension.class)
@Import(CourseAccessService.class)
@ContextConfiguration
public class CourseAccessServiceTests {

    @MockBean
    StudentRepository studentRepository;

    @MockBean
    StaffRepository staffRepository;

    @Autowired
    CourseAccessService courseAccessService;

    @Test
    public void commons_with_no_course_is_open_to_everyone() {
        User user = User.builder().email("regular@ucsb.edu").admin(false).build();
        Commons commons = Commons.builder().id(1L).courseId(null).build();

        assertTrue(courseAccessService.isEligibleForCommons(user, commons));
    }

    @Test
    public void admin_is_always_eligible_for_a_course_linked_commons() {
        User admin = User.builder().email("admin@ucsb.edu").admin(true).build();
        Commons commons = Commons.builder().id(1L).courseId(5L).build();

        when(studentRepository.findByEmail("admin@ucsb.edu")).thenReturn(new ArrayList<>());
        when(staffRepository.findByEmail("admin@ucsb.edu")).thenReturn(new ArrayList<>());

        assertTrue(courseAccessService.isEligibleForCommons(admin, commons));
    }

    @Test
    public void student_on_roster_is_eligible() {
        User user = User.builder().email("student@ucsb.edu").admin(false).build();
        Commons commons = Commons.builder().id(1L).courseId(5L).build();

        Student student = Student.builder().email("student@ucsb.edu").courseId(5L).build();
        List<Student> students = new ArrayList<>();
        students.add(student);

        when(studentRepository.findByEmail("student@ucsb.edu")).thenReturn(students);
        when(staffRepository.findByEmail("student@ucsb.edu")).thenReturn(new ArrayList<>());

        assertTrue(courseAccessService.isEligibleForCommons(user, commons));
    }

    @Test
    public void staff_on_roster_is_eligible() {
        User user = User.builder().email("staff@ucsb.edu").admin(false).build();
        Commons commons = Commons.builder().id(1L).courseId(5L).build();

        Staff staff = Staff.builder().email("staff@ucsb.edu").courseId(5L).build();
        List<Staff> staffList = new ArrayList<>();
        staffList.add(staff);

        when(studentRepository.findByEmail("staff@ucsb.edu")).thenReturn(new ArrayList<>());
        when(staffRepository.findByEmail("staff@ucsb.edu")).thenReturn(staffList);

        assertTrue(courseAccessService.isEligibleForCommons(user, commons));
    }

    @Test
    public void user_not_on_roster_is_not_eligible() {
        User user = User.builder().email("outsider@ucsb.edu").admin(false).build();
        Commons commons = Commons.builder().id(1L).courseId(5L).build();

        when(studentRepository.findByEmail("outsider@ucsb.edu")).thenReturn(new ArrayList<>());
        when(staffRepository.findByEmail("outsider@ucsb.edu")).thenReturn(new ArrayList<>());

        assertFalse(courseAccessService.isEligibleForCommons(user, commons));
    }

    @Test
    public void student_on_roster_for_a_different_course_is_not_eligible() {
        User user = User.builder().email("student@ucsb.edu").admin(false).build();
        Commons commons = Commons.builder().id(1L).courseId(5L).build();

        Student student = Student.builder().email("student@ucsb.edu").courseId(99L).build();
        List<Student> students = new ArrayList<>();
        students.add(student);

        when(studentRepository.findByEmail("student@ucsb.edu")).thenReturn(students);
        when(staffRepository.findByEmail("student@ucsb.edu")).thenReturn(new ArrayList<>());

        assertFalse(courseAccessService.isEligibleForCommons(user, commons));
    }

    @Test
    public void getCourseIdsForUser_returns_distinct_union_of_student_and_staff_courses() {
        User user = User.builder().email("both@ucsb.edu").admin(false).build();

        Student student1 = Student.builder().email("both@ucsb.edu").courseId(5L).build();
        Student student2 = Student.builder().email("both@ucsb.edu").courseId(6L).build();
        List<Student> students = new ArrayList<>();
        students.add(student1);
        students.add(student2);

        Staff staff = Staff.builder().email("both@ucsb.edu").courseId(6L).build();
        List<Staff> staffList = new ArrayList<>();
        staffList.add(staff);

        when(studentRepository.findByEmail("both@ucsb.edu")).thenReturn(students);
        when(staffRepository.findByEmail("both@ucsb.edu")).thenReturn(staffList);

        List<Long> courseIds = courseAccessService.getCourseIdsForUser(user);

        assertEquals(2, courseIds.size());
        assertTrue(courseIds.contains(5L));
        assertTrue(courseIds.contains(6L));
    }

    @Test
    public void getCourseIdsForUser_skips_null_course_ids_and_dedups_duplicates() {
        User user = User.builder().email("many@ucsb.edu").admin(false).build();

        Student studentWithNullCourse = Student.builder().email("many@ucsb.edu").courseId(null).build();
        Student studentNew = Student.builder().email("many@ucsb.edu").courseId(5L).build();
        Student studentDuplicate = Student.builder().email("many@ucsb.edu").courseId(5L).build();
        List<Student> students = new ArrayList<>();
        students.add(studentWithNullCourse);
        students.add(studentNew);
        students.add(studentDuplicate);

        Staff staffWithNullCourse = Staff.builder().email("many@ucsb.edu").courseId(null).build();
        Staff staffNew = Staff.builder().email("many@ucsb.edu").courseId(7L).build();
        Staff staffDuplicate = Staff.builder().email("many@ucsb.edu").courseId(7L).build();
        List<Staff> staffList = new ArrayList<>();
        staffList.add(staffWithNullCourse);
        staffList.add(staffNew);
        staffList.add(staffDuplicate);

        when(studentRepository.findByEmail("many@ucsb.edu")).thenReturn(students);
        when(staffRepository.findByEmail("many@ucsb.edu")).thenReturn(staffList);

        List<Long> courseIds = courseAccessService.getCourseIdsForUser(user);

        assertEquals(2, courseIds.size());
        assertTrue(courseIds.contains(5L));
        assertTrue(courseIds.contains(7L));
    }
}
