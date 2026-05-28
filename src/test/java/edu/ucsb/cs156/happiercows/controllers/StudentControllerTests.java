package edu.ucsb.cs156.happiercows.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.Student;
import edu.ucsb.cs156.happiercows.models.StudentDTO;
import edu.ucsb.cs156.happiercows.repositories.StudentRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.mockito.Mockito.verify;

@WebMvcTest(controllers = StudentController.class)
public class StudentControllerTests extends ControllerTestCase {

  @MockBean
  UserRepository userRepository;

  @MockBean
  StudentRepository studentRepository;

  @WithMockUser(roles = { "USER" })
  @Test
  public void allStudents__user_logged_in() throws Exception {
    Student student1 = Student.builder()
        .id(1L)
        .firstMiddleName("First")
        .lastName("Student")
        .email("first@student.ucsb.edu")
        .perm("11111111")
        .courseId(123L)
        .build();

    Student student2 = Student.builder()
        .id(2L)
        .firstMiddleName("Second")
        .lastName("Student")
        .email("second@student.ucsb.edu")
        .perm("22222222")
        .courseId(123L)
        .build();

    when(studentRepository.findAll()).thenReturn(List.of(student1, student2));
    String expectedJson = mapper.writeValueAsString(List.of(student1, student2));

    MvcResult response = mockMvc.perform(get("/api/student/all"))
        .andExpect(status().isOk()).andReturn();

    assertEquals(expectedJson, response.getResponse().getContentAsString());
  }

  @WithMockUser(roles = { "ADMIN" })
  @Test
  public void getStudentById__admin_logged_in() throws Exception {
    Student student = Student.builder()
        .id(17L)
        .firstMiddleName("Test")
        .lastName("Student")
        .email("test@student.ucsb.edu")
        .perm("33333333")
        .courseId(456L)
        .build();

    when(studentRepository.findById(17L)).thenReturn(Optional.of(student));
    String expectedJson = mapper.writeValueAsString(student);

    MvcResult response = mockMvc.perform(get("/api/student/17"))
        .andExpect(status().isOk()).andReturn();

    assertEquals(expectedJson, response.getResponse().getContentAsString());
  }

  @WithMockUser(roles = { "ADMIN" })
  @Test
  public void postStudent__admin_logged_in() throws Exception {
    StudentDTO studentDTO = StudentDTO.builder()
        .firstMiddleName("New")
        .lastName("Student")
        .email("new@student.ucsb.edu")
        .perm("44444444")
        .courseId(789L)
        .build();

    Student savedStudent = Student.builder()
        .id(99L)
        .firstMiddleName(studentDTO.getFirstMiddleName())
        .lastName(studentDTO.getLastName())
        .email(studentDTO.getEmail())
        .perm(studentDTO.getPerm())
        .courseId(studentDTO.getCourseId())
        .build();

    when(studentRepository.save(any(Student.class))).thenReturn(savedStudent);
    String requestJson = mapper.writeValueAsString(studentDTO);
    String expectedJson = mapper.writeValueAsString(savedStudent);

    MvcResult response = mockMvc.perform(post("/api/student")
        .with(csrf())
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestJson))
        .andExpect(status().isOk()).andReturn();

    assertEquals(expectedJson, response.getResponse().getContentAsString());
  }

  @WithMockUser(roles = { "ADMIN" })
  @Test
  public void updateStudent__admin_logged_in() throws Exception {
    Student existing = Student.builder()
        .id(17L)
        .firstMiddleName("Old")
        .lastName("OldLastName")
        .email("old@student.ucsb.edu")
        .perm("55555555")
        .courseId(111L)
        .build();

    StudentDTO studentDTO = StudentDTO.builder()
        .firstMiddleName("Updated")
        .lastName("UpdatedLastName")
        .email("updated@student.ucsb.edu")
        .perm("66666666")
        .courseId(222L)
        .build();

    when(studentRepository.findById(17L)).thenReturn(Optional.of(existing));
    when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

    String requestJson = mapper.writeValueAsString(studentDTO);

    MvcResult response = mockMvc.perform(put("/api/student?id=17")
        .with(csrf())
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestJson))
        .andExpect(status().isOk()).andReturn();

    String responseString = response.getResponse().getContentAsString();
    Student responseStudent = mapper.readValue(responseString, Student.class);

    assertEquals(17L, responseStudent.getId());
    assertEquals("Updated", responseStudent.getFirstMiddleName());
    assertEquals("UpdatedLastName", responseStudent.getLastName());
    assertEquals("updated@student.ucsb.edu", responseStudent.getEmail());
    assertEquals("66666666", responseStudent.getPerm());
    assertEquals(222L, responseStudent.getCourseId());
  }

  @WithMockUser(roles = { "ADMIN" })
  @Test
  public void deleteStudent__admin_logged_in() throws Exception {
    Student existing = Student.builder()
        .id(17L)
        .firstMiddleName("Delete")
        .lastName("Student")
        .email("delete@student.ucsb.edu")
        .perm("77777777")
        .courseId(333L)
        .build();

    when(studentRepository.findById(17L)).thenReturn(Optional.of(existing));

    MvcResult response = mockMvc.perform(delete("/api/student?id=17")
   .with(csrf()))
        .andExpect(status().isOk()).andReturn();

    assertEquals(mapper.writeValueAsString(Map.of("message", "Student with id 17 deleted")),
        response.getResponse().getContentAsString());
    verify(studentRepository).delete(existing);
  }
  @WithMockUser(roles = { "ADMIN" })
  @Test
  public void getStudentById__admin_logged_in_not_found() throws Exception {
    when(studentRepository.findById(17L)).thenReturn(Optional.empty());

    mockMvc.perform(get("/api/student/17"))
        .andExpect(status().isNotFound());
  }
  @WithMockUser(roles = { "ADMIN" })
  @Test
  public void updateStudent__admin_logged_in_not_found() throws Exception {
  StudentDTO studentDTO = StudentDTO.builder()
      .firstMiddleName("Updated")
      .lastName("Student")
      .email("updated@student.ucsb.edu")
      .perm("66666666")
      .courseId(222L)
      .build();

  when(studentRepository.findById(17L)).thenReturn(Optional.empty());

  mockMvc.perform(put("/api/student?id=17")
      .with(csrf())
      .contentType(MediaType.APPLICATION_JSON)
      .content(mapper.writeValueAsString(studentDTO)))
      .andExpect(status().isNotFound());
  }
  @WithMockUser(roles = { "ADMIN" })

  @Test
  public void deleteStudent__admin_logged_in_not_found() throws Exception {
    when(studentRepository.findById(17L)).thenReturn(Optional.empty());

    mockMvc.perform(delete("/api/student?id=17")
        .with(csrf()))
        .andExpect(status().isNotFound());
  }
}