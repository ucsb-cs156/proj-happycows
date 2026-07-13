package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.Student;
import edu.ucsb.cs156.happiercows.models.StudentDTO;
import edu.ucsb.cs156.happiercows.repositories.StudentRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.http.MediaType;

import java.util.ArrayList;
import java.util.Optional;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = StudentController.class)
public class StudentControllerTests extends ControllerTestCase {
    @MockBean
    StudentRepository studentRepository;

    @MockBean
    UserRepository userRepository;

    // Logged out users
    @Test
    public void logged_out_users_cannot_get_all() throws Exception {
        mockMvc.perform(get("/api/student/all"))
                .andExpect(status().is(403));
    }

    @Test
    public void logged_out_users_cannot_get_by_course() throws Exception {
        mockMvc.perform(get("/api/student/course/1"))
                .andExpect(status().is(403));
    }

    @Test
    public void logged_out_users_cannot_get_by_id() throws Exception {
        mockMvc.perform(get("/api/student/1"))
                .andExpect(status().is(403));
    }

    @Test
    public void logged_out_users_cannot_post() throws Exception {
        StudentDTO studentDTO = StudentDTO.builder()
                .lastName("Ferber")
                .firstMiddleName("Sally")
                .email("sallyferber@ucsb.edu")
                .perm("1234567")
                .courseId(1L)
                .build();

        mockMvc.perform(post("/api/student")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(studentDTO)))
                .andExpect(status().is(403));
    }

    // Regular users cannot access

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_regular_user_cannot_get_all_students() throws Exception {
        mockMvc.perform(get("/api/student/all"))
                .andExpect(status().is(403));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_regular_user_cannot_get_student_by_id() throws Exception {
        mockMvc.perform(get("/api/student/1"))
                .andExpect(status().is(403));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_regular_user_cannot_post_student() throws Exception {
        StudentDTO studentDTO = StudentDTO.builder()
                .lastName("Ferber")
                .firstMiddleName("Sally")
                .email("sallyferber@ucsb.edu")
                .perm("1234567")
                .courseId(1L)
                .build();

        mockMvc.perform(post("/api/student")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(studentDTO)))
                .andExpect(status().is(403));
    }

    // Admin positive tests

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_get_all_students() throws Exception {
        Student s1 = Student.builder()
                .lastName("Ferber")
                .firstMiddleName("Sally")
                .email("sallyferber@ucsb.edu")
                .perm("1234567")
                .courseId(1L)
                .build();

        Student s2 = Student.builder()
                .lastName("Diaz")
                .firstMiddleName("Cristina")
                .email("cristinadiaz@ucsb.edu")
                .perm("7654321")
                .courseId(1L)
                .build();

        ArrayList<Student> expectedStudents = new ArrayList<>();
        expectedStudents.add(s1);
        expectedStudents.add(s2);

        when(studentRepository.findAll()).thenReturn(expectedStudents);

        MvcResult response = mockMvc.perform(get("/api/student/all"))
                .andExpect(status().isOk()).andReturn();

        verify(studentRepository, times(1)).findAll();
        String expectedJson = mapper.writeValueAsString(expectedStudents);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_get_students_for_a_course() throws Exception {
        Student s1 = Student.builder()
                .lastName("Ferber")
                .firstMiddleName("Sally")
                .email("sallyferber@ucsb.edu")
                .perm("1234567")
                .courseId(1L)
                .build();

        ArrayList<Student> expectedStudents = new ArrayList<>();
        expectedStudents.add(s1);

        when(studentRepository.findByCourseId(1L)).thenReturn(expectedStudents);

        MvcResult response = mockMvc.perform(get("/api/student/course/1"))
                .andExpect(status().isOk()).andReturn();

        verify(studentRepository, times(1)).findByCourseId(1L);
        String expectedJson = mapper.writeValueAsString(expectedStudents);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_get_student_by_id() throws Exception {
        Student student = Student.builder()
                .id(7L)
                .lastName("Ferber")
                .firstMiddleName("Sally")
                .email("sallyferber@ucsb.edu")
                .perm("1234567")
                .courseId(1L)
                .build();

        when(studentRepository.findById(7L)).thenReturn(Optional.of(student));

        MvcResult response = mockMvc.perform(get("/api/student/7"))
                .andExpect(status().isOk()).andReturn();

        verify(studentRepository, times(1)).findById(7L);
        String expectedJson = mapper.writeValueAsString(student);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_cannot_get_student_when_it_does_not_exist() throws Exception {
        when(studentRepository.findById(7L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/student/7"))
                .andExpect(status().isNotFound());

        verify(studentRepository, times(1)).findById(7L);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_post_new_student() throws Exception {
        StudentDTO studentDTO = StudentDTO.builder()
                .lastName("Ferber")
                .firstMiddleName("Sally")
                .email("sallyferber@ucsb.edu")
                .perm("1234567")
                .courseId(1L)
                .build();

        Student student = Student.builder()
                .lastName("Ferber")
                .firstMiddleName("Sally")
                .email("sallyferber@ucsb.edu")
                .perm("1234567")
                .courseId(1L)
                .build();

        Student savedStudent = Student.builder()
                .id(123L)
                .lastName("Ferber")
                .firstMiddleName("Sally")
                .email("sallyferber@ucsb.edu")
                .perm("1234567")
                .courseId(1L)
                .build();

        when(studentRepository.save(student)).thenReturn(savedStudent);

        MvcResult response = mockMvc.perform(post("/api/student")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(studentDTO)))
                .andExpect(status().isOk()).andReturn();

        verify(studentRepository, times(1)).save(student);
        String expectedJson = mapper.writeValueAsString(savedStudent);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_delete_a_student() throws Exception {
        Student student1 = Student.builder()
                .lastName("Ferber")
                .firstMiddleName("Sally")
                .email("sallyferber@ucsb.edu")
                .perm("1234567")
                .courseId(1L)
                .build();

        when(studentRepository.findById(eq(15L))).thenReturn(Optional.of(student1));

        MvcResult response = mockMvc
                .perform(delete("/api/student/15").with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        verify(studentRepository, times(1)).findById(15L);
        verify(studentRepository, times(1)).delete(any());

        Map<String, Object> json = responseToJson(response);
        assertEquals("Student with id 15 deleted", json.get("message"));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_tries_to_delete_non_existant_student_and_gets_right_error_message() throws Exception {
        when(studentRepository.findById(eq(15L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc
                .perform(delete("/api/student/15").with(csrf()))
                .andExpect(status().isNotFound())
                .andReturn();

        verify(studentRepository, times(1)).findById(15L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("Student with id 15 not found", json.get("message"));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_edit_an_existing_student() throws Exception {
        Student studentOrig = Student.builder()
                .lastName("Ferber")
                .firstMiddleName("Sally")
                .email("sallyferber@ucsb.edu")
                .perm("1234567")
                .courseId(1L)
                .build();

        StudentDTO studentEditedDTO = StudentDTO.builder()
                .lastName("Ferberson")
                .firstMiddleName("Sallie")
                .email("sallieferberson@ucsb.edu")
                .perm("7654321")
                .courseId(2L)
                .build();

        Student studentEdited = Student.builder()
                .lastName("Ferberson")
                .firstMiddleName("Sallie")
                .email("sallieferberson@ucsb.edu")
                .perm("7654321")
                .courseId(2L)
                .build();

        String requestBody = mapper.writeValueAsString(studentEditedDTO);

        when(studentRepository.findById(eq(67L))).thenReturn(Optional.of(studentOrig));

        MvcResult response = mockMvc
                .perform(
                        put("/api/student/67")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("utf-8")
                                .content(requestBody)
                                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        verify(studentRepository, times(1)).findById(67L);
        verify(studentRepository, times(1)).save(studentEdited);
        String responseString = response.getResponse().getContentAsString();
        String expectedJson = mapper.writeValueAsString(studentEdited);
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_cannot_edit_student_that_does_not_exist() throws Exception {
        StudentDTO studentEditedDTO = StudentDTO.builder()
                .lastName("Ferberson")
                .firstMiddleName("Sallie")
                .email("sallieferberson@ucsb.edu")
                .perm("7654321")
                .courseId(2L)
                .build();

        String requestBody = mapper.writeValueAsString(studentEditedDTO);

        when(studentRepository.findById(eq(67L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc
                .perform(
                        put("/api/student/67")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("utf-8")
                                .content(requestBody)
                                .with(csrf()))
                .andExpect(status().isNotFound())
                .andReturn();

        verify(studentRepository, times(1)).findById(67L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("Student with id 67 not found", json.get("message"));
    }
}
