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

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.Profit;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.UserCommons;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.ProfitRepository;
import edu.ucsb.cs156.happiercows.repositories.UserCommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.databind.JsonNode;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

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
        public void logged_in_users_can_get_all() throws Exception {
                mockMvc.perform(get("/api/Students/all"))
                                .andExpect(status().is(200)); // logged
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

        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {
                Students student = Students.builder()
                        .lName("Song")
                        .fmName("AlecJ")
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

        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {

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


        
        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_user_can_get_all_Students() throws Exception {
                Students student1 = Students.builder()
                        .lName("Song")
                        .fmName("AlecJ")
                        .email("alecsong@ucsb.edu")
                        .perm("1234567")
                        .courseId((long)156)
                        .build();

                Students student2 = Students.builder()
                        .lName("Song2")
                        .fmName("AlecJ2")
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
                        .lName("Song")
                        .fmName("AlecJ")
                        .email("alecsong@ucsb.edu")
                        .perm("1234567")
                        .courseId((long)156)
                        .build();

                when(StudentsRepository.save(eq(student1))).thenReturn(student1);

                // act
                MvcResult response = mockMvc.perform(
                                post("/api/Students/post?lName=Song&fmName=AlecJ&email=alecsong@ucsb.edu&perm=1234567&courseId=156")
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(StudentsRepository, times(1)).save(student1);
                String expectedJson = mapper.writeValueAsString(student1);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }
}

