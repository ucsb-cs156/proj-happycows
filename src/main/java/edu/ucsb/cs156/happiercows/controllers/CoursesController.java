package edu.ucsb.cs156.happiercows.controllers;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.happiercows.entities.Courses;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.models.HealthUpdateStrategyList;
import edu.ucsb.cs156.happiercows.repositories.CoursesRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import edu.ucsb.cs156.happiercows.services.CommonsPlusBuilderService;
import java.util.Optional;


@Slf4j
@Tag(name = "Courses")
@RequestMapping("/api/courses")
@RestController
public class CoursesController extends ApiController{
    @Autowired
    CoursesRepository coursesRepository;

    // Get all records in the table and return as a JSON array
    @Operation(summary= "List all courses")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all")
    public Iterable<Courses> allCourses() {
        Iterable<Courses> items = coursesRepository.findAll();
        return items;
    }


    // Use the data in the input parameters to create a new row in the table and return the data as JSON
    @Operation(summary= "Create a new course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/post")
    public Courses postCourses(
            @Parameter(name="subjectArea") @RequestParam String subjectArea,
            @Parameter(name="courseNumber") @RequestParam Integer courseNumber,
            @Parameter(name="courseName") @RequestParam String courseName)
            throws JsonProcessingException {


        Courses course = new Courses();
        course.setSubjectArea(subjectArea);
        course.setCourseNumber(courseNumber);
        course.setCourseName(courseName);

        Courses savedCourse = coursesRepository.save(course);

        return savedCourse;
    }
}
