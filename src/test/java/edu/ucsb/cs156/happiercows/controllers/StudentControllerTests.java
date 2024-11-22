package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.entities.Student;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.repositories.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@WebMvcTest(StudentController.class)  // Specify the controller to test
public class StudentControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StudentRepository studentRepository;  // Mocking the StudentRepository

    @BeforeEach
    public void setUp() {
        // Set the security context for testing (pretend the user has ROLE_ADMIN)
        User adminUser = new User("admin", "password", List.of(() -> "ROLE_ADMIN"));
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(new UsernamePasswordAuthenticationToken(adminUser, "password", adminUser.getAuthorities()));
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    public void testGetStudentById_Success() throws Exception {
        // Prepare mock data
        Long studentId = 1L;
        Student student = new Student();
        student.setId(studentId);
        student.setName("John Doe");
        student.setEmail("johndoe@ucsb.edu");

        // Mock the repository behavior
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));

        // Perform the GET request and assert the response
        mockMvc.perform(get("/api/students?id=" + studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(studentId))
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("johndoe@ucsb.edu"));

        // Verify the repository interaction
        verify(studentRepository, times(1)).findById(studentId);
    }

    @Test
    public void testGetStudentById_NotFound() throws Exception {
        // Prepare mock data
        Long studentId = 1L;

        // Mock the repository behavior to return empty
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

        // Perform the GET request and assert the response (expecting a 404 status)
        mockMvc.perform(get("/api/students?id=" + studentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Entity Student with id 1 not found"));

        // Verify the repository interaction
        verify(studentRepository, times(1)).findById(studentId);
    }
}
