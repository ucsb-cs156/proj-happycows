package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.Course;
import edu.ucsb.cs156.happiercows.models.CourseDTO;
import edu.ucsb.cs156.happiercows.repositories.CourseRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.http.MediaType;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@WebMvcTest(controllers = CourseController.class)
public class CourseControllerTests extends ControllerTestCase {
    @MockBean
    CourseRepository courseRepository;

    @MockBean
    UserRepository userRepository;

    // Logged out users
    @Test
    public void logged_out_users_cannot_get_all() throws Exception {
        mockMvc.perform(get("/api/course/all"))
                .andExpect(status().is(403)); // logged out users can't get all
    }

    @Test
    public void logged_out_users_cannot_get_by_id() throws Exception {
        mockMvc.perform(get("/api/course/1"))
                .andExpect(status().is(403));
    }

    @Test
    public void logged_out_users_cannot_post() throws Exception {
        CourseDTO courseDTO = CourseDTO.builder()
                .code("CMPSC 156")
                .name("Advanced App Programming")
                .term("F24")
                .build();

        mockMvc.perform(post("/api/course")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(courseDTO)))
                .andExpect(status().is(403));
    }

    // Regular users positive tests

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_user_can_get_all_courses() throws Exception {
        // arrange

        Course advapp = Course.builder()
            .code("CMPSC 156")
            .name("Advanced App Programming")
            .term("F24")
            .build();

        Course ethics = Course.builder()
            .code("ENGR")
            .name("Ethics in Engineering")
            .term("F24")
            .build();

        ArrayList<Course> expectedCourses = new ArrayList<>();
        expectedCourses.add(advapp);
        expectedCourses.add(ethics);

        when(courseRepository.findAll()).thenReturn(expectedCourses);

        // act
        MvcResult response = mockMvc.perform(get("/api/course/all"))
                .andExpect(status().isOk()).andReturn();

        // assert

        verify(courseRepository, times(1)).findAll();
        String expectedJson = mapper.writeValueAsString(expectedCourses);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_user_cannot_get_course_by_id() throws Exception {
        mockMvc.perform(get("/api/course/1"))
                .andExpect(status().is(403));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_user_cannot_post_course() throws Exception {
        CourseDTO courseDTO = CourseDTO.builder()
                .code("CMPSC 156")
                .name("Advanced App Programming")
                .term("F24")
                .build();

        mockMvc.perform(post("/api/course")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(courseDTO)))
                .andExpect(status().is(403));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_get_course_by_id() throws Exception {

        Course course = Course.builder()
            .id(7L)
            .code("CMPSC 156")
            .name("Advanced App Programming")
            .term("F24")
            .build();

        when(courseRepository.findById(7L)).thenReturn(Optional.of(course));

        MvcResult response = mockMvc.perform(get("/api/course/7"))
                .andExpect(status().isOk()).andReturn();

        verify(courseRepository, times(1)).findById(7L);
        String expectedJson = mapper.writeValueAsString(course);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_cannot_get_course_when_it_does_not_exist() throws Exception {
        when(courseRepository.findById(7L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/course/7"))
                .andExpect(status().isNotFound());

        verify(courseRepository, times(1)).findById(7L);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_post_new_course() throws Exception {

        CourseDTO courseDTO = CourseDTO.builder()
                .code("CMPSC 156")
                .name("Advanced App Programming")
                .term("F24")
                .build();

        Course course = Course.builder()
                .code("CMPSC 156")
                .name("Advanced App Programming")
                .term("F24")
                .build();

        Course savedCourse = Course.builder()
                .id(123L)
                .code("CMPSC 156")
                .name("Advanced App Programming")
                .term("F24")
                .build();

        when(courseRepository.save(course)).thenReturn(savedCourse);

        MvcResult response = mockMvc.perform(post("/api/course")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(courseDTO)))
                .andExpect(status().isOk()).andReturn();

        verify(courseRepository, times(1)).save(course);
        String expectedJson = mapper.writeValueAsString(savedCourse);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

        @WithMockUser(roles = {"ADMIN", "USER"})
        @Test
        public void admin_can_edit_an_existing_course() throws Exception {
        // arrange

        Course courseOrig =
                Course.builder()
                .code("cs156")
                .name("adv app dev")
                .term("s26")
                .build();

        Course courseEdited =
                Course.builder()
                .code("cs8")
                .name("intro py")
                .term("f23")
                .build();

        String requestBody = mapper.writeValueAsString(courseEdited);

        when(courseRepository.findById(eq(67L)))
                .thenReturn(Optional.of(courseOrig));

        // act
        MvcResult response =
                mockMvc
                .perform(
                        put("/api/course")
                        .param("id", "67")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        // assert
        verify(courseRepository, times(1)).findById(67L);
        verify(courseRepository, times(1))
                .save(courseEdited); // should be saved with correct user
        String responseString = response.getResponse().getContentAsString();
        assertEquals(requestBody, responseString);
        }

        @WithMockUser(roles = {"ADMIN", "USER"})
        @Test
        public void admin_cannot_edit_course_that_does_not_exist() throws Exception {
        // arrange

        Course editedCourse =
                Course.builder()
                .code("cs156")
                .name("adv app dev")
                .term("s26")
                .build();

        String requestBody = mapper.writeValueAsString(editedCourse);

        when(courseRepository.findById(eq(67L))).thenReturn(Optional.empty());

        // act
        MvcResult response =
                mockMvc
                .perform(
                        put("/api/course")
                        .param("id", "67")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody)
                        .with(csrf()))
                .andExpect(status().isNotFound())
                .andReturn();

        // assert
        verify(courseRepository, times(1)).findById(67L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("Course with id 67 not found", json.get("message"));
        }

        @WithMockUser(roles = {"ADMIN", "USER"})
        @Test
        public void admin_can_delete_a_course() throws Exception {
        // arrange

        Course course1 =
                Course.builder()
                .code("cs156")
                .name("adv app dev")
                .term("s26")
                .build();

        when(courseRepository.findById(eq(15L))).thenReturn(Optional.of(course1));

        // act
        MvcResult response =
                mockMvc
                .perform(delete("/api/course").param("id", "15").with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        // assert
        verify(courseRepository, times(1)).findById(15L);
        verify(courseRepository, times(1)).delete(any());

        Map<String, Object> json = responseToJson(response);
        assertEquals("Course with id 15 deleted", json.get("message"));
        }

        @WithMockUser(roles = {"ADMIN", "USER"})
        @Test
        public void
        admin_tries_to_delete_non_existant_course_and_gets_right_error_message()
                throws Exception {
        // arrange

        when(courseRepository.findById(eq(15L))).thenReturn(Optional.empty());

        // act
        MvcResult response =
                mockMvc
                .perform(delete("/api/course").param("id", "15").with(csrf()))
                .andExpect(status().isNotFound())
                .andReturn();

        // assert
        verify(courseRepository, times(1)).findById(15L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("Course with id 15 not found", json.get("message"));
        }
}
