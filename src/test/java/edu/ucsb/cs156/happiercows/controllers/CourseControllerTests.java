package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.Course;
import edu.ucsb.cs156.happiercows.repositories.CourseRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.testconfig.TestConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import java.beans.Transient;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.eq;
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

    @Test
    public void logged_out_users_cannot_get_by_id() throws Exception {
        mockMvc
            .perform(get("/api/course?id=7"))
            .andExpect(status().is(403));
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void logged_in_user_get_by_id_course_doesnt_exist() throws Exception {
        // arrange

        when (courseRepository.findById(eq(123L))).thenReturn(Optional.empty());

        // act

        MvcResult response =
            mockMvc.perform(get("/api/course?id=123")).andExpect(status().isNotFound()).andReturn();

        // assert

        verify(courseRepository, times(1)).findById(eq(123L));
        Map<String, Object> json = responseToJson(response);
        assertEquals("EntityNotFoundException", json.get("type"));
        assertEquals("Course with id 123 not found", json.get("message"));
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void logged_in_user_get_by_id_course_exists() throws Exception {
        // arrange

        Course course =
            Course.builder()
                .code("CMPSC 156")
                .name("Advanced Applications Programming")
                .term("F25")
                .build();

        when(courseRepository.findById(eq(7L))).thenReturn(Optional.of(course));

        // act

        MvcResult response =
            mockMvc.perform(get("/api/course?id=7")).andExpect(status().isOk()).andReturn();

        // assert

        verify(courseRepository, times(1)).findById(eq(7L));
        String expectedJson = mapper.writeValueAsString(course);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }
}
