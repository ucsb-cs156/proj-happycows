package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.entities.Course;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.models.CourseDTO;
import edu.ucsb.cs156.happiercows.repositories.CourseRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Tag(name = "Course")
@RequestMapping("/api/course")
@RestController
public class CourseController extends ApiController {
    @Autowired
    private CourseRepository courseRepository;

    /**
     * This method returns a list of all courses.
     * 
     * @return a list of all courses
     */
    @Operation(summary = "List all courses")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all")
    public Iterable<Course> allCourses() {
        Iterable<Course> courses = courseRepository.findAll();
        return courses;
    }

    @Operation(summary = "Create a course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("")
    public Course postCourse(
            @Parameter(name = "code") @RequestParam String code,
            @Parameter(name = "name") @RequestParam String name,
            @Parameter(name = "term") @RequestParam String term) {
                Course course = new Course();
                course.setCode(code);
                course.setName(name);
                course.setTerm(term);
                Course savedCourse = courseRepository.save(course);

                return savedCourse;
    }

    @Operation(summary = "Get a single course by id")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/{id}")
    public Course getCourseById(
            @Parameter(name = "id") @PathVariable Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Course.class, id));
        return course;
    }

    @Operation(summary = "Update a single course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public Course updateCourse(
        @Parameter(name = "id") @PathVariable Long id,
        @RequestBody @Valid Course incoming) {

        Course course =
            courseRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Course.class, id));

        course.setCode(incoming.getCode());
        course.setName(incoming.getName());
        course.setTerm(incoming.getTerm());

        courseRepository.save(course);

        return course;
    }

    @Operation(summary = "Delete a course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public Object deleteCourse(@Parameter(name = "id") @PathVariable Long id) {
        Course course =
            courseRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Course.class, id));

        courseRepository.delete(course);
        return genericMessage("Course with id %s deleted".formatted(id));
    }
}