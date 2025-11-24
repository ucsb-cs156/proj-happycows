package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.entities.Course;
import edu.ucsb.cs156.happiercows.repositories.CourseRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import com.fasterxml.jackson.core.JsonProcessingException;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;


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
      /**
   * Create a new Course
   *
   * @param code the course code
   * @param name the course name
   * @param term the course term
   * @return the saved Course
   */
  @Operation(summary = "Create a new course")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("")
  public Course postCourse(
      @Parameter(name = "code") @RequestParam String code,
      @Parameter(name = "name") @RequestParam String name,
      @Parameter(name = "term") @RequestParam String term
     )
      throws JsonProcessingException {

    // For an explanation of @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    // See: https://www.baeldung.com/spring-date-parameters

    Course course = new Course();
    course.setCode(code);
    course.setName(name);
    course.setTerm(term);


    Course savedCourse = courseRepository.save(course);

    return savedCourse;
  }

  /**
   * Get a single course by id
   *
   * @param id the id of the course
   * @return a course
   */
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

  /**
   * Update a single course
   *
   * @param id id of the date to course
   * @param incoming the new course
   * @return the updated course object
   */
  @Operation(summary = "Update a single course")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PutMapping("")
  public Course updateCourse(
      @Parameter(name = "id") @RequestParam Long id, @RequestBody @Valid Course incoming) {

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

  /**
   * Delete a Course
   *
   * @param id the id of the course to delete
   * @return a message indicating the course was deleted
   */
  @Operation(summary = "Delete a course")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @DeleteMapping("")
  public Object deleteCourse(@Parameter(name = "id") @RequestParam Long id) {
    Course course =
        courseRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(Course.class, id));

    courseRepository.delete(course);
    return genericMessage("Course with id %s deleted".formatted(id));
  }
}


