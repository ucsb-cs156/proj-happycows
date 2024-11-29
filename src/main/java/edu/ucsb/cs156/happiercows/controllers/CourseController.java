package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.entities.Course;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.models.HealthUpdateStrategyList;
import edu.ucsb.cs156.happiercows.repositories.CourseRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@Tag(name = "courses")
@RequestMapping("/api/courses")
@RestController
@Slf4j
public class CourseController extends ApiController {

    @Autowired
    CourseRepository courseRepository;

    // Get all records in the table and return as a JSON array
    @Operation(summary= "List all courses")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all")
    public Iterable<Course> allCourses() {
        Iterable<Course> courses = courseRepository.findAll();
        return courses;
    }

    // Use the data in the input parameters to create a new row in the table and return the data as JSON
    @Operation(summary= "Create a new course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/post")
    public Course postCourse(
            @Parameter(name = "name") @RequestParam String name,
            @Parameter(name = "school") @RequestParam String school,
            @Parameter(name = "term") @RequestParam String term,
            @Parameter(name = "startDate", description = "in iso format, i.e. YYYY-MM-DDTHH:MM:SS") 
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(name = "endDate", description = "in iso format, i.e. YYYY-MM-DDTHH:MM:SS") 
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
    
        Course course = Course.builder()
                .name(name)
                .school(school)
                .term(term)
                .startDate(startDate)
                .endDate(endDate)
                .build();
    
        return courseRepository.save(course);
    }
}   

