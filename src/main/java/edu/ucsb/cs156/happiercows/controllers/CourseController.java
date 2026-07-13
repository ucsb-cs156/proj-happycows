package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.entities.Course;
import edu.ucsb.cs156.happiercows.enums.School;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.models.CourseDTO;
import edu.ucsb.cs156.happiercows.repositories.CourseRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

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
     * The schools offered in the Course create/edit dropdown. Only "active"
     * schools are returned; see {@link School} for schools kept in the
     * codebase as examples but not yet offered to users.
     *
     * @return the list of active schools
     */
    @Operation(summary = "List the schools available for a course")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/schools")
    public List<School> getActiveSchools() {
        return Arrays.stream(School.values())
                .filter(School::isActive)
                .collect(Collectors.toList());
    }

    @Operation(summary = "Get a course by id")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/{id}")
    public Course getCourseById(
            @Parameter(name = "id") @PathVariable Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Course.class, id));
        return course;
    }

    @Operation(summary = "Create a course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("")
    public Course postCourse(
            @Parameter(name = "course") @RequestBody CourseDTO courseDTO) {
        Course savedCourse = courseRepository.save(courseDTO.toCourse());
        return savedCourse;
    }

    @Operation(summary = "Update a single course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public Course updateCourse(
    	@Parameter(name = "id") @PathVariable Long id, @RequestBody CourseDTO courseDTO) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Course.class, id));
    
	course.setCode(courseDTO.getCode());
	course.setName(courseDTO.getName());
	course.setTerm(courseDTO.getTerm());
	course.setSchool(courseDTO.getSchool());

	courseRepository.save(course);

	return course;
	}

    @Operation(summary = "Delete a single course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public Object deleteCourse(
        @Parameter(name = "id") @PathVariable Long id){
	Course course = courseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Course.class, id));

	courseRepository.delete(course);
	return genericMessage("Course with id %s deleted".formatted(id));
	}
}
