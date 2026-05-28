package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.entities.Student;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.models.StudentDTO;
import edu.ucsb.cs156.happiercows.repositories.StudentRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.extern.slf4j.Slf4j;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Tag(name = "Student")
@RequestMapping("/api/student")
@RestController
public class StudentController extends ApiController {
    @Autowired
    private StudentRepository studentRepository;

    /**
     * This method returns a list of all students.
     * 
     * @return a list of all students
     */
    @Operation(summary = "List all students")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all")
    public Iterable<Student> allStudents() {
        Iterable<Student> students = studentRepository.findAll();
        return students;
    }

    @Operation(summary = "Get a student by id")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/{id}")
    public Student getStudentById(
            @Parameter(name = "id") @PathVariable Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Student.class, id));
        return student;
    }

    @Operation(summary = "Create a student")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("")
    public Student postStudent(@Parameter(name = "student") @RequestBody StudentDTO studentDTO) {
        return studentRepository.save(studentDTO.toStudent());
    }

    @Operation(summary = "Update a single student")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("")
    public Student updateStudent(@Parameter(name = "id") @RequestParam Long id,
                                 @Parameter(name = "student") @RequestBody StudentDTO studentDTO) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Student.class, id));

        student.setLastName(studentDTO.getLastName());
        student.setFirstMiddleName(studentDTO.getFirstMiddleName());
        student.setEmail(studentDTO.getEmail());
        student.setPerm(studentDTO.getPerm());
        student.setCourseId(studentDTO.getCourseId());

        return studentRepository.save(student);
    }

    @Operation(summary = "Delete a student")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("")
    public Object deleteStudent(@Parameter(name = "id") @RequestParam Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Student.class, id));

        studentRepository.delete(student);
        return genericMessage("Student with id %d deleted".formatted(id));
    }
}
       