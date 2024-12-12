package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.entities.Course;
import edu.ucsb.cs156.happiercows.entities.Student;
import edu.ucsb.cs156.happiercows.repositories.CourseRepository;
import edu.ucsb.cs156.happiercows.repositories.StudentRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Tag(name = "Students")
@RequestMapping("/api/students")
@RestController
@Slf4j
public class StudentsController extends ApiController {

        public enum Status {
                INSERTED, UPDATED
        };

        @Autowired
        CourseRepository courseRepository;

        @Autowired
        StudentRepository studentRepository;

        @Autowired
        UserRepository userRepository;

        @Operation(summary = "Get Students for course")
        @PreAuthorize("hasRole('ROLE_ADMIN')")
        @GetMapping("/all")
        public Iterable<Student> getStaff(
                        @Parameter(name = "courseId") @RequestParam Long courseId)
                        throws JsonProcessingException {

                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new EntityNotFoundException(Course.class, courseId.toString()));

                Iterable<Student> students = studentRepository.findByCourseId(course.getId());
                return students;
        }

        @Operation(summary = "Upload Students for Course in UCSB Egrades Format")
        @PreAuthorize("hasRole('ROLE_ADMIN')")
        @PostMapping(value = "/upload/egrades", consumes = { "multipart/form-data" })
        public Map<String, String> getStaff(
                        @Parameter(name = "courseId") @RequestParam Long courseId,
                        @Parameter(name = "file") @RequestParam("file") MultipartFile file)
                        throws JsonProcessingException, IOException, CsvException {

                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new EntityNotFoundException(Course.class, courseId.toString()));

                int counts[] = { 0, 0 };

                try (InputStream inputStream = new BufferedInputStream(file.getInputStream());
                                InputStreamReader reader = new InputStreamReader(inputStream);
                                CSVReader csvReader = new CSVReader(reader);) {
                        csvReader.skip(2);
                        List<String[]> myEntries = csvReader.readAll();
                        for (String[] row : myEntries) {
                                Student student = fromEgradesCSVRow(row);
                                student.setCourseId(course.getId());
                                Status s = upsertStudent(student, course);
                                counts[s.ordinal()]++;
                        }
                }
                return Map.of(
                                "filename", file.getOriginalFilename(),
                                "message", String.format("Inserted %d new students, Updated %d students",
                                                counts[Status.INSERTED.ordinal()], counts[Status.UPDATED.ordinal()]));

        }

        public Student fromEgradesCSVRow(String[] row) {
                return Student.builder()
                                .fname(row[5])
                                .lname(row[4])
                                .studentId(row[1])
                                .email(row[10])
                                .build();
        }

        public Status upsertStudent(Student student, Course course) {
                Optional<Student> existingStudent = studentRepository.findByCourseIdAndStudentId(course.getId(),
                                student.getStudentId());
                if (existingStudent.isPresent()) {
                        Student existingStudentObj = existingStudent.get();
                        existingStudentObj.setFname(student.getFname());
                        existingStudentObj.setLname(student.getLname());
                        existingStudentObj.setEmail(student.getEmail());
                        studentRepository.save(existingStudentObj);
                        return Status.UPDATED;
                } else {
                        studentRepository.save(student);
                        return Status.INSERTED;
                }

        }

}