package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.Students;
import edu.ucsb.cs156.happiercows.repositories.StudentsRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;
import java.util.Arrays;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import org.springframework.http.MediaType;

@WebMvcTest(controllers = StudentsController.class)
@AutoConfigureDataJpa
public class StudentsControllerTests extends ControllerTestCase {

        @MockBean
        StudentsRepository StudentsRepository;

        @MockBean
        UserRepository userRepository;

        // Authorization tests for /api/Students/admin/all

        @Test
        public void logged_out_users_cannot_get_all() throws Exception {
                mockMvc.perform(get("/api/Students/all"))
                                .andExpect(status().is(403)); // logged out users can't get all
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_users_cannot_get_all() throws Exception {
                mockMvc.perform(get("/api/Students/all"))
                                .andExpect(status().is(403)); // logged
        }

        @Test
        public void logged_out_users_cannot_get_by_id() throws Exception {
                mockMvc.perform(get("/api/Students?id=7"))
                                .andExpect(status().is(403)); // logged out users can't get by id
        }

        // Authorization tests for /api/Students/post
        // (Perhaps should also have these for put and delete)

        @Test
        public void logged_out_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/Students/post"))
                                .andExpect(status().is(403));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_regular_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/Students/post"))
                                .andExpect(status().is(403)); // only admins can post
        }

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void test_that_logged_in_admin_can_get_by_id_when_the_id_exists() throws Exception {
                Students student = Students.builder()
                        .lastName("Song")
                        .firstMiddleName("AlecJ")
                        .email("alecsong@ucsb.edu")
                        .perm("1234567")
                        .courseId((long)156)
                        .build();

                when(StudentsRepository.findById(eq(7L))).thenReturn(Optional.of(student));

                // act
                MvcResult response = mockMvc.perform(get("/api/Students?id=7"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(StudentsRepository, times(1)).findById(eq(7L));
                String expectedJson = mapper.writeValueAsString(student);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void test_that_logged_in_admin_can_get_by_id_when_the_id_does_not_exist() throws Exception {

                // arrange

                when(StudentsRepository.findById(eq(7L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(get("/api/Students?id=7"))
                                .andExpect(status().isNotFound()).andReturn();

                // assert

                verify(StudentsRepository, times(1)).findById(eq(7L));
                Map<String, Object> json = responseToJson(response);
                assertEquals("EntityNotFoundException", json.get("type"));
                assertEquals("Students with id 7 not found", json.get("message"));
        }


        
        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void logged_in_admin_can_get_all_Students() throws Exception {
                Students student1 = Students.builder()
                        .lastName("Song")
                        .firstMiddleName("AlecJ")
                        .email("alecsong@ucsb.edu")
                        .perm("1234567")
                        .courseId((long)156)
                        .build();

                Students student2 = Students.builder()
                        .lastName("Song2")
                        .firstMiddleName("AlecJ2")
                        .email("alecsong2@ucsb.edu")
                        .perm("12345672")
                        .courseId((long)1562)
                        .build();

                ArrayList<Students> expectedRequests = new ArrayList<>();
                expectedRequests.addAll(Arrays.asList(student1, student2));

                when(StudentsRepository.findAll()).thenReturn(expectedRequests);

                // act
                MvcResult response = mockMvc.perform(get("/api/Students/all"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(StudentsRepository, times(1)).findAll();
                String expectedJson = mapper.writeValueAsString(expectedRequests);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void an_admin_user_can_post_a_new_Students() throws Exception {
                Students student1 = Students.builder()
                        .lastName("Song")
                        .firstMiddleName("AlecJ")
                        .email("alecsong@ucsb.edu")
                        .perm("1234567")
                        .courseId((long)156)
                        .build();

                when(StudentsRepository.save(eq(student1))).thenReturn(student1);

                // act
                MvcResult response = mockMvc.perform(
                                post("/api/Students/post?lastName=Song&firstMiddleName=AlecJ&email=alecsong@ucsb.edu&perm=1234567&courseId=156")
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(StudentsRepository, times(1)).save(student1);
                String expectedJson = mapper.writeValueAsString(student1);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }
        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_can_edit_an_existing_Students() throws Exception {
                Students StudentsOrig = Students.builder()
                                .lastName("Song")
                                .firstMiddleName("AlecJ")
                                .email("alecsong@ucsb.edu")
                                .perm("1234567")
                                .build();

                Students StudentsEdited = Students.builder()
                                .lastName("Song2")
                                .firstMiddleName("AlecJ2")
                                .email("alecsong2@ucsb.edu")
                                .perm("12345672")
                                .build();

                String requestBody = mapper.writeValueAsString(StudentsEdited);

                when(StudentsRepository.findById(eq(67L))).thenReturn(Optional.of(StudentsOrig));

                // act
                MvcResult response = mockMvc.perform(
                                put("/api/Students?id=67")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .characterEncoding("utf-8")
                                                .content(requestBody)
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(StudentsRepository, times(1)).findById(67L);
                verify(StudentsRepository, times(1)).save(StudentsEdited); // should be saved with correct user
                String responseString = response.getResponse().getContentAsString();
                assertEquals(requestBody, responseString);
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_cannot_edit_Students_that_does_not_exist() throws Exception {

                Students StudentsEdited = Students.builder()
                                .lastName("Song")
                                .firstMiddleName("AlecJ")
                                .email("alecsong@ucsb.edu")
                                .perm("1234567")
                                .courseId((long)156)
                                .build();

                String requestBody = mapper.writeValueAsString(StudentsEdited);

                when(StudentsRepository.findById(eq(67L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(
                                put("/api/Students?id=67")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .characterEncoding("utf-8")
                                                .content(requestBody)
                                                .with(csrf()))
                                .andExpect(status().isNotFound()).andReturn();

                // assert
                verify(StudentsRepository, times(1)).findById(67L);
                Map<String, Object> json = responseToJson(response);
                assertEquals("Students with id 67 not found", json.get("message"));
        }
}

