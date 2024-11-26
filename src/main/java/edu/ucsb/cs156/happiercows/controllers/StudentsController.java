package edu.ucsb.cs156.happiercows.controllers;
import edu.ucsb.cs156.happiercows.entities.Students;
import edu.ucsb.cs156.happiercows.repositories.StudentsRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.web.bind.annotation.RequestParam;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.time.LocalDateTime;
import javax.validation.Valid;

@Tag(name = "Students")
@RequestMapping("/api/Students")
@RestController
@Slf4j
public class StudentsController extends ApiController {

    @Autowired
    StudentsRepository StudentsRepository;

    /**
     * List all students
     * 
     * @return an iterable of Students
     */
    @Operation(summary= "List all students")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public Iterable<Students> allStudents() {
        Iterable<Students> students = StudentsRepository.findAll();
        return students;
    }

    /**
     * Create new Student
     * 
     * @param lastName        last name
     * @param firstMiddleName       first and middle name
     * @param email           email
     * @param perm            Perm number
     * @param courseId        course ID
     * @return saved student
     */
    @Operation(summary= "Create a Student")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/post")
    public Students postStudents(
            @Parameter(name = "lastName") @RequestParam String lastName,
            @Parameter(name = "firstMiddleName") @RequestParam String firstMiddleName,
            @Parameter(name = "email") @RequestParam String email,
            @Parameter(name = "perm") @RequestParam String perm,
            @Parameter(name="courseId") @RequestParam Long courseId)
            throws JsonProcessingException {
        Students student = Students.builder()
                .lastName(lastName)
                .firstMiddleName(firstMiddleName)
                .email(email)
                .perm(perm)
                .courseId(courseId)
                .build();
        Students savedStudents = StudentsRepository.save(student);
        return savedStudents;
    }

    /**
     * Get a student by id
     * 
     * @param id the id of the student
     * @return a Student
     */
    @Operation(summary = "Get a single Student by id")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("")
    public Students getById(
            @Parameter(name = "id") @RequestParam Long id) {
        Students students = StudentsRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Students.class, id));

        return students;
    }

        /**
     * Update a single Student
     * 
     * @param id       id of the Student to update
     * @param incoming the new Student
     * @return the updated Students object
     */
    @Operation(summary= "Update a single Students")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("")
    public Students updateStudents(
            @Parameter(name="id") @RequestParam Long id,
            @RequestBody @Valid Students incoming) {

        Students student = StudentsRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Students.class, id));

        student.setLastName(incoming.getLastName());
        student.setFirstMiddleName(incoming.getFirstMiddleName());
        student.setEmail(incoming.getEmail());
        student.setPerm(incoming.getPerm());

        StudentsRepository.save(student);

        return student;
    }
}
