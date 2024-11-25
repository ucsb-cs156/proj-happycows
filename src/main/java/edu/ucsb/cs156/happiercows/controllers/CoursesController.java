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
import org.springframework.format.annotation.DateTimeFormat;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import edu.ucsb.cs156.happiercows.services.CommonsPlusBuilderService;
import java.util.Optional;
import java.time.LocalDateTime;

import javax.transaction.Transactional;
import javax.validation.Valid;


@Slf4j
@Tag(name = "Courses")
@RequestMapping("/api/courses")
@RestController

public class CoursesController extends ApiController {
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


    // Use the data in the input parameters to create a new row in the table and
    // return the data as JSON
    @Operation(summary= "Create a new course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/post")
    public Courses postCourses(
            @Parameter(name = "name", description = "course name, e.g. CMPSC 156") @RequestParam String name,
            @Parameter(name = "school", description = "school abbreviation e.g. UCSB") @RequestParam String school,
            @Parameter(name = "term", description = "quarter or semester, e.g. F23") @RequestParam String term,
            @Parameter(name = "startDate", description = "in iso format, i.e. YYYY-mm-ddTHH:MM:SS; e.g. 2023-10-01T00:00:00 see https://en.wikipedia.org/wiki/ISO_8601") @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(name = "endDate", description = "in iso format, i.e. YYYY-mm-ddTHH:MM:SS; e.g. 2023-12-31T11:59:59 see https://en.wikipedia.org/wiki/ISO_8601") @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate)
            throws JsonProcessingException {

        Courses course = new Courses();
        course.setName(name);
        course.setSchool(school);
        course.setTerm(term);
        course.setStartDate(startDate);
        course.setEndDate(endDate);

        Courses savedCourse = coursesRepository.save(course);

        return savedCourse;
    }

    @Operation(summary = "Delete a course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("")
    public Object deleteCourses(
            @Parameter(description = "ID of the Courses to delete") @RequestParam Long id) {
        Courses course = coursesRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Courses.class, id));

        coursesRepository.delete(course);
        return genericMessage(String.format("Courses with id %s deleted", id));
    }

    @Operation(summary= "Get a single course")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("")
    public Courses getById(
            @Parameter(name="id") @RequestParam Long id) {
        Courses course = coursesRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Courses.class, id));

        return course;
    }

}

