package edu.ucsb.cs156.happiercows.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.awaitility.Awaitility.await;

import static java.util.concurrent.TimeUnit.SECONDS;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.Course;
import edu.ucsb.cs156.happiercows.entities.Student;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.jobs.Job;
import edu.ucsb.cs156.happiercows.repositories.CourseRepository;
import edu.ucsb.cs156.happiercows.repositories.StudentRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.repositories.jobs.JobsRepository;
import edu.ucsb.cs156.happiercows.services.jobs.JobService;
import lombok.extern.slf4j.Slf4j;

import org.mockito.ArgumentCaptor;
import org.mockito.Captor;

import java.util.Map;

@Slf4j
@WebMvcTest(controllers = StudentsController.class)
@Import(JobService.class)
@AutoConfigureDataJpa
public class StudentsControllerTests extends ControllerTestCase {

        @MockBean
        UserRepository userRepository;

        @MockBean
        CourseRepository courseRepository;

        @MockBean
        StudentRepository studentRepository;

        @Autowired
        ObjectMapper objectMapper;

        Course course1 = Course.builder()
                        .id(1L)
                        .name("CS156")
                        .school("UCSB")
                        .term("F23")
                        .startDate(LocalDateTime.parse("2023-09-01T00:00:00"))
                        .endDate(LocalDateTime.parse("2023-12-31T00:00:00"))
                        .build();

        Course course2 = Course.builder()
                        .id(1L)
                        .name("CS148")
                        .school("UCSB")
                        .term("S24")
                        .startDate(LocalDateTime.parse("2024-01-01T00:00:00"))
                        .endDate(LocalDateTime.parse("2024-03-31T00:00:00"))
                        .build();

        Student student1 = Student.builder()
                        .id(1L)
                        .courseId(course1.getId())
                        .fname("Chris")
                        .lname("Gaucho")
                        .email("cgaucho@ucsb.edu")
                        .studentId("A123456")
                        .build();

        Student student2 = Student.builder()
                        .id(2L)
                        .courseId(course1.getId())
                        .fname("Lauren")
                        .lname("Del Playa")
                        .email("ldelplaya@ucsb.edu")
                        .studentId("A987654")
                        .build();

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void admin_can_get_all_students_for_a_course() throws Exception {

                // arrange

                ArrayList<Student> expectedStudents = new ArrayList<>();
                expectedStudents.add(student1);

                when(courseRepository.findById(eq(course1.getId()))).thenReturn(Optional.of(course1));
                when(studentRepository.findByCourseId(eq(course1.getId()))).thenReturn(expectedStudents);

                // act
                MvcResult response = mockMvc.perform(get("/api/students/all?courseId=1"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(courseRepository, atLeastOnce()).findById(eq(course1.getId()));
                verify(studentRepository, atLeastOnce()).findByCourseId(eq(course1.getId()));
                String expectedJson = mapper.writeValueAsString(expectedStudents);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void admin_cannot_get_all_students_for_a_non_existing_course() throws Exception {

                // arrange

                when(courseRepository.findById(eq(course1.getId()))).thenReturn(Optional.empty());

                // act 
                MvcResult response = mockMvc.perform(get("/api/students/all?courseId=1"))
                                .andExpect(status().isNotFound()).andReturn();

                // assert

                verify(courseRepository, atLeastOnce()).findById(eq(course1.getId()));
                String responseString = response.getResponse().getContentAsString();
                Map<String,String> expectedMap = Map.of(
                        "type", "EntityNotFoundException",
                        "message", "Course with id 1 not found"
                      );
                String expectedJson = mapper.writeValueAsString(expectedMap);
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void admin_cannot_upload_students_for_a_non_existing_course() throws Exception {

                // arrange

                MockMultipartFile file = new MockMultipartFile(
                                "file",
                                "egrades.csv",
                                MediaType.TEXT_PLAIN_VALUE,
                                "Hello, World!".getBytes());

                when(courseRepository.findById(eq(course1.getId()))).thenReturn(Optional.empty());

                // act

                MvcResult response = mockMvc
                                .perform(multipart("/api/students/upload/egrades?courseId=1").file(file).with(csrf()))
                                .andExpect(status().isNotFound()).andReturn();

                // assert

                verify(courseRepository, atLeastOnce()).findById(eq(course1.getId()));
                String responseString = response.getResponse().getContentAsString();
                Map<String,String> expectedMap = Map.of(
                        "type", "EntityNotFoundException",
                        "message", "Course with id 1 not found"
                      );
                String expectedJson = mapper.writeValueAsString(expectedMap);
                assertEquals(expectedJson, responseString);
        }

        private final String sampleCSVContents = """
                        Enrl Cd,Perm #,Grade,Final Units,Student Last,Student First Middle,Quarter,Course ID,Section,Meeting Time(s) / Location(s),Email,ClassLevel,Major1,Major2,Date/Time,Pronoun

                        08235,A123456,,4.0,GAUCHO,CHRIS FAKE,F23,CMPSC156,0100,T R   2:00- 3:15 SH 1431     W    5:00- 5:50 PHELP 3525  W    6:00- 6:50 PHELP 3525  W    7:00- 7:50 PHELP 3525  ,cgaucho@umail.ucsb.edu,SR,CMPSC,,9/27/2023 9:39:25 AM,
                        08250,A987654,,4.0,DEL PLAYA,LAUREN,F23,CMPSC156,0100,T R   2:00- 3:15 SH 1431     W    5:00- 5:50 PHELP 3525  W    6:00- 6:50 PHELP 3525  W    7:00- 7:50 PHELP 3525  ,ldelplaya@umail.ucsb.edu,SR,CMPSC,,9/27/2023 9:39:25 AM,She (She/Her/Hers)
                        08243,1234567,,4.0,TARDE,SABADO,F23,CMPSC156,0100,T R   2:00- 3:15 SH 1431     W    5:00- 5:50 PHELP 3525  W    6:00- 6:50 PHELP 3525  W    7:00- 7:50 PHELP 3525  ,sabadotarde@umail.ucsb.edu,SR,CMPSC,,9/27/2023 9:39:25 AM,He (He/Him/His)
                        """;

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void admin_can_upload_students_for_an_existing_course() throws Exception {

                // arrange

                 Student student2After = Student.builder()
                        .id(2L)
                        .courseId(course1.getId())
                        .fname("LAUREN")
                        .lname("DEL PLAYA")
                        .email("ldelplaya@umail.ucsb.edu")
                        .studentId("A987654")
                        .courseId(course1.getId())
                        .build();

                  Student student3Before = Student.builder()
                        .courseId(course1.getId())
                        .fname("SABADO")
                        .lname("TARDE")
                        .email("sabadotarde@umail.ucsb.edu")
                        .studentId("1234567")
                        .courseId(course1.getId())
                        .build();

                  Student student3After = Student.builder()
                        .id(2L)
                        .courseId(course1.getId())
                        .fname("SABADO")
                        .lname("TARDE")
                        .email("sabadotarde@umail.ucsb.edu")
                        .studentId("1234567")
                        .courseId(course1.getId())
                        .build();

                MockMultipartFile file = new MockMultipartFile(
                                "file",
                                "egrades.csv",
                                MediaType.TEXT_PLAIN_VALUE,
                                sampleCSVContents.getBytes());

                when(courseRepository.findById(eq(course1.getId()))).thenReturn(Optional.of(course1));
                when(studentRepository.findByCourseIdAndStudentId(eq(course1.getId()), eq("A123456")))
                                .thenReturn(Optional.of(student1));
                when(studentRepository.findByCourseIdAndStudentId(eq(course1.getId()), eq("A987654")))
                                .thenReturn(Optional.of(student2));
                when(studentRepository.findByCourseIdAndStudentId(eq(course1.getId()), eq("1234567")))
                                .thenReturn(Optional.empty());

                when(studentRepository.save(eq(student2After))).thenReturn(student2After);
                when(studentRepository.save(eq(student3Before))).thenReturn(student3After);

                // act

                MvcResult response = mockMvc
                                .perform(multipart("/api/students/upload/egrades?courseId=1").file(file).with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(courseRepository, atLeastOnce()).findById(eq(course1.getId()));
                String responseString = response.getResponse().getContentAsString();
                Map<String,String> expectedMap = Map.of(
                        "filename", "egrades.csv",
                        "message", "Inserted 1 new students, Updated 2 students"
                      );
                String expectedJson = mapper.writeValueAsString(expectedMap);
                assertEquals(expectedJson, responseString);
                verify(studentRepository, atLeastOnce()).findByCourseIdAndStudentId(eq(course1.getId()), eq("A123456"));
                verify(studentRepository, atLeastOnce()).findByCourseIdAndStudentId(eq(course1.getId()), eq("A987654"));
                verify(studentRepository, atLeastOnce()).findByCourseIdAndStudentId(eq(course1.getId()), eq("1234567"));

                verify(studentRepository, atLeastOnce()).save(eq(student2After));
                verify(studentRepository, atLeastOnce()).save(eq(student3Before));
        }

}