package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.Student;
import edu.ucsb.cs156.happiercows.models.StudentDTO;
import edu.ucsb.cs156.happiercows.repositories.StudentRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.http.MediaType;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
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

    // CSV upload tests

    @Test
    public void logged_out_users_cannot_upload_csv() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "roster.csv", "text/csv", "lastName,firstMiddleName,email,perm\n".getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(multipart("/api/student/upload/csv").file(file).param("courseId", "1").with(csrf()))
                .andExpect(status().is(403));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void regular_users_cannot_upload_csv() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "roster.csv", "text/csv", "lastName,firstMiddleName,email,perm\n".getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(multipart("/api/student/upload/csv").file(file).param("courseId", "1").with(csrf()))
                .andExpect(status().is(403));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_upload_generic_format_csv() throws Exception {
        String csv = "lastName,firstMiddleName,email,perm\n"
                + "Ferber,Sally,sallyferber@ucsb.edu,1234567\n"
                + "Diaz,Cristina,cristinadiaz@ucsb.edu,2345678\n";
        MockMultipartFile file = new MockMultipartFile(
                "file", "roster.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        when(studentRepository.findByCourseIdAndEmail(eq(1L), any())).thenReturn(new ArrayList<>());

        MvcResult response = mockMvc
                .perform(multipart("/api/student/upload/csv").file(file).param("courseId", "1").with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        verify(studentRepository, times(2)).save(any());
        Map<String, Object> json = responseToJson(response);
        assertEquals(2, json.get("created"));
        assertEquals(List.of(), json.get("skippedEmails"));
    }

    // Header row + blank line, matching the real UCSB eGrades export format
    // (see docs/examples/egrades.csv). commons-csv's CSVFormat.DEFAULT
    // ignores blank lines automatically, so no special handling is needed
    // beyond detecting the real 16-column header.
    private static final String UCSB_EGRADES_HEADER =
            "Enrl Cd,Perm #,Grade,Final Units,Student Last,Student First Middle,Quarter,"
                    + "Course ID,Section,Meeting Time(s) / Location(s),Email,ClassLevel,Major1,"
                    + "Major2,Date/Time,Pronoun\n\n";

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_upload_ucsb_egrades_format_csv() throws Exception {
        String csv = UCSB_EGRADES_HEADER
                + "08235,A123456,,4.0,GAUCHO,CHRIS FAKE,F23,CMPSC156,0100,"
                + "T R 2:00-3:15 SH 1431,cgaucho@umail.ucsb.edu,SR,CMPSC,,9/27/2023 9:39:25 AM,\n";
        MockMultipartFile file = new MockMultipartFile(
                "file", "roster.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        when(studentRepository.findByCourseIdAndEmail(eq(1L), any())).thenReturn(new ArrayList<>());

        MvcResult response = mockMvc
                .perform(multipart("/api/student/upload/csv").file(file).param("courseId", "1").with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        Student expected = Student.builder()
                .perm("A123456")
                .lastName("GAUCHO")
                .firstMiddleName("CHRIS FAKE")
                .email("cgaucho@umail.ucsb.edu")
                .courseId(1L)
                .build();
        verify(studentRepository, times(1)).save(expected);

        Map<String, Object> json = responseToJson(response);
        assertEquals(1, json.get("created"));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_upload_the_real_egrades_csv_example_file() throws Exception {
        Path egradesPath = Path.of("docs", "examples", "egrades.csv");
        byte[] csvBytes = Files.readAllBytes(egradesPath);
        MockMultipartFile file = new MockMultipartFile("file", "egrades.csv", "text/csv", csvBytes);

        when(studentRepository.findByCourseIdAndEmail(eq(1L), any())).thenReturn(new ArrayList<>());

        MvcResult response = mockMvc
                .perform(multipart("/api/student/upload/csv").file(file).param("courseId", "1").with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> json = responseToJson(response);
        assertEquals(3, json.get("created"));
        assertEquals(List.of(), json.get("skippedEmails"));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_upload_chico_state_canvas_format_csv() throws Exception {
        String csv = "Student Name,Student ID,Student SIS ID,Email,Section Name\n"
                + "Marge Simpson,88200,013228559,msimpson@csuchico.edu,"
                + "CSED 500 - 362 Computational Thinking Summer 2025\n";
        MockMultipartFile file = new MockMultipartFile(
                "file", "roster.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        when(studentRepository.findByCourseIdAndEmail(eq(1L), any())).thenReturn(new ArrayList<>());

        MvcResult response = mockMvc
                .perform(multipart("/api/student/upload/csv").file(file).param("courseId", "1").with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        Student expected = Student.builder()
                .perm("013228559")
                .lastName("Simpson")
                .firstMiddleName("Marge")
                .email("msimpson@csuchico.edu")
                .courseId(1L)
                .build();
        verify(studentRepository, times(1)).save(expected);

        Map<String, Object> json = responseToJson(response);
        assertEquals(1, json.get("created"));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void duplicate_emails_are_skipped_not_saved() throws Exception {
        String csv = "lastName,firstMiddleName,email,perm\n"
                + "Ferber,Sally,sallyferber@ucsb.edu,1234567\n";
        MockMultipartFile file = new MockMultipartFile(
                "file", "roster.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        Student existing = Student.builder().email("sallyferber@ucsb.edu").courseId(1L).build();
        List<Student> existingList = new ArrayList<>();
        existingList.add(existing);
        when(studentRepository.findByCourseIdAndEmail(1L, "sallyferber@ucsb.edu")).thenReturn(existingList);

        MvcResult response = mockMvc
                .perform(multipart("/api/student/upload/csv").file(file).param("courseId", "1").with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        verify(studentRepository, times(0)).save(any());
        Map<String, Object> json = responseToJson(response);
        assertEquals(0, json.get("created"));
        assertEquals(List.of("sallyferber@ucsb.edu"), json.get("skippedEmails"));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void empty_csv_file_is_rejected() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "roster.csv", "text/csv", "".getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(multipart("/api/student/upload/csv").file(file).param("courseId", "1").with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void unrecognized_header_format_is_rejected() throws Exception {
        String csv = "not,a,known,format\nfoo,bar,baz,qux\n";
        MockMultipartFile file = new MockMultipartFile(
                "file", "roster.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(multipart("/api/student/upload/csv").file(file).param("courseId", "1").with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void malformed_row_with_too_few_columns_is_rejected() throws Exception {
        String csv = "lastName,firstMiddleName,email,perm\nFerber,Sally,sallyferber@ucsb.edu\n";
        MockMultipartFile file = new MockMultipartFile(
                "file", "roster.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(multipart("/api/student/upload/csv").file(file).param("courseId", "1").with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void malformed_row_with_too_many_columns_is_rejected() throws Exception {
        String csv = "lastName,firstMiddleName,email,perm\nFerber,Sally,sallyferber@ucsb.edu,1234567,extra\n";
        MockMultipartFile file = new MockMultipartFile(
                "file", "roster.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(multipart("/api/student/upload/csv").file(file).param("courseId", "1").with(csrf()))
                .andExpect(status().isBadRequest());
    }
}
