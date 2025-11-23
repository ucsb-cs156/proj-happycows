package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.entities.Course;
import edu.ucsb.cs156.happiercows.repositories.CourseRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.Optional;


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
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/all")
    public Iterable<Course> allOrganisations() {
        Iterable<Course> courses = courseRepository.findAll();
        return courses;
    }

    //get a single course
    @Operation(summary = "Get a course by ID")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        Optional<Course> courseOpt = courseRepository.findById(id);
        if (courseOpt.isPresent()) {
            return ResponseEntity.ok(courseOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    //create a new course
    @Operation(summary = "Create a new course")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("")
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        Course savedCourse = courseRepository.save(course);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCourse);
    }

    //update an existing course
    @Operation(summary = "Update an existing course")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course updatedCourse) {
        Optional<Course> courseOpt = courseRepository.findById(id);
        if (!courseOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Course course = courseOpt.get();
        course.setCode(updatedCourse.getCode());
        course.setName(updatedCourse.getName());
        course.setTerm(updatedCourse.getTerm());

        Course savedCourse = courseRepository.save(course);
        return ResponseEntity.ok(savedCourse);
    }

    //delete a course
    @Operation(summary = "Delete a course")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {

        if (!courseRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        courseRepository.deleteById(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
