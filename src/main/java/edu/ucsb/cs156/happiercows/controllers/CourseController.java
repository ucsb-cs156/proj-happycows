package edu.ucsb.cs156.happiercows.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import edu.ucsb.cs156.happiercows.entities.Course;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.repositories.CourseRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
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
    public Iterable<Course> allOrganisations() {
        Iterable<Course> courses = courseRepository.findAll();
        return courses;
    }

    @Operation(summary = "Get a single course")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("")

    public Course getById(@Parameter(name = "id") @RequestParam Long id) {
        Course course =
            courseRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Course.class, id));

        return course;
    }
}
