package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.entities.Student;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.helpers.StudentCsvFormat;
import edu.ucsb.cs156.happiercows.models.CsvUploadResult;
import edu.ucsb.cs156.happiercows.models.StudentDTO;
import edu.ucsb.cs156.happiercows.repositories.StudentRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Slf4j
@Tag(name = "Student")
@RequestMapping("/api/student")
@RestController
public class StudentController extends ApiController {
    @Autowired
    private StudentRepository studentRepository;

    @Operation(summary = "List all roster students")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public Iterable<Student> allStudents() {
        return studentRepository.findAll();
    }

    @Operation(summary = "List the roster students for a single course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/course/{courseId}")
    public Iterable<Student> studentsForCourse(
            @Parameter(name = "courseId") @PathVariable Long courseId) {
        return studentRepository.findByCourseId(courseId);
    }

    @Operation(summary = "Get a roster student by id")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/{id}")
    public Student getStudentById(
            @Parameter(name = "id") @PathVariable Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Student.class, id));
    }

    @Operation(summary = "Add a roster student to a course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("")
    public Student postStudent(
            @Parameter(name = "student") @RequestBody StudentDTO studentDTO) {
        return studentRepository.save(studentDTO.toStudent());
    }

    @Operation(summary = "Update a single roster student")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public Student updateStudent(
            @Parameter(name = "id") @PathVariable Long id, @RequestBody StudentDTO studentDTO) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Student.class, id));

        student.setLastName(studentDTO.getLastName());
        student.setFirstMiddleName(studentDTO.getFirstMiddleName());
        student.setEmail(studentDTO.getEmail());
        student.setPerm(studentDTO.getPerm());
        student.setCourseId(studentDTO.getCourseId());

        studentRepository.save(student);

        return student;
    }

    @Operation(summary = "Remove a roster student from a course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public Object deleteStudent(
            @Parameter(name = "id") @PathVariable Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Student.class, id));

        studentRepository.delete(student);
        return genericMessage("Student with id %s deleted".formatted(id));
    }

    /**
     * Bulk-adds roster students to a course from an uploaded CSV file. The
     * CSV's header row is used to auto-detect which school's roster export
     * format it is (see {@link StudentCsvFormat}); rows whose email is
     * already on the course roster are skipped rather than duplicated.
     *
     * @param courseId the course to add the students to
     * @param file the uploaded CSV file
     * @return a summary of how many students were created, and which emails
     *         were skipped as already-on-roster
     */
    @Operation(summary = "Upload a CSV file of roster students for a course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping(value = "/upload/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CsvUploadResult uploadStudentsCsv(
            @Parameter(name = "courseId") @RequestParam Long courseId,
            @Parameter(name = "file") @RequestParam("file") MultipartFile file) throws IOException {

        List<CSVRecord> records;
        try (CSVParser parser = CSVFormat.DEFAULT.parse(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            records = parser.getRecords();
        }

        if (records.isEmpty()) {
            throw new IllegalArgumentException("CSV file is empty");
        }

        Iterator<CSVRecord> rows = records.iterator();

        List<String> headerValues = new ArrayList<>();
        for (String value : rows.next()) {
            headerValues.add(value);
        }

        StudentCsvFormat format = StudentCsvFormat.detect(headerValues);
        if (format == null) {
            throw new IllegalArgumentException("Unrecognized CSV header format");
        }

        int created = 0;
        List<String> skippedEmails = new ArrayList<>();

        while (rows.hasNext()) {
            CSVRecord row = rows.next();
            if (row.size() != format.getHeaders().size()) {
                throw new IllegalArgumentException(
                        "Row %d does not have the expected number of columns".formatted(row.getRecordNumber()));
            }

            Student student = format.toStudent(row, courseId);

            if (studentRepository.findByCourseIdAndEmail(courseId, student.getEmail()).iterator().hasNext()) {
                skippedEmails.add(student.getEmail());
                continue;
            }

            studentRepository.save(student);
            created++;
        }

        return CsvUploadResult.builder()
                .created(created)
                .skippedEmails(skippedEmails)
                .build();
    }
}
