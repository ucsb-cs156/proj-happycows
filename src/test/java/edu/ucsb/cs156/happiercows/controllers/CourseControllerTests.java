package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.Course;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.repositories.CourseRepository;
import edu.ucsb.cs156.happiercows.testconfig.TestConfig;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CourseController.class)
@Import(TestConfig.class)
@AutoConfigureDataJpa
public class CourseControllerTests extends ControllerTestCase {

    @MockBean
    CourseRepository courseRepository;

    @MockBean
    UserRepository userRepository;

    @Test
    @WithMockUser(roles = { "USER" })
    public void logged_in_users_can_get_all() throws Exception {
        mockMvc.perform(get("/api/courses/all"))
                .andExpect(status().is(200)); // logged in
    }

    @Test
    public void logged_out_users_cannot_get_all() throws Exception {
        mockMvc.perform(get("/api/courses/all"))
                .andExpect(status().is(403)); // not logged in
    }

    @Test
    @WithMockUser(roles = { "USER" })
    public void logged_in_user_can_get_all_courses() throws Exception {

        // arrange
        Course course1 = Course.builder()
                .name("CS156")
                .school("UCSB")
                .term("S23")
                .startDate(LocalDateTime.parse("2023-10-01T00:00:00"))
                .endDate(LocalDateTime.parse("2023-10-30T00:00:00"))
                .build();

        Course course2 = Course.builder()
                .name("CS156")
                .school("UCSB")
                .term("F23")
                .startDate(LocalDateTime.parse("2024-09-04T00:00:00"))
                .endDate(LocalDateTime.parse("2024-02-24T00:00:00"))
                .build();

        ArrayList<Course> expectedCourses = new ArrayList<>();
        expectedCourses.addAll(Arrays.asList(course1, course2));

        when(courseRepository.findAll()).thenReturn(expectedCourses);

        // act
        MvcResult response = mockMvc.perform(get("/api/courses/all"))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(courseRepository, times(1)).findAll();
        String expectedJson = mapper.writeValueAsString(expectedCourses);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @Test
    public void logged_out_users_cannot_post() throws Exception {
        mockMvc.perform(post("/api/courses/post"))
                .andExpect(status().is(403)); // logged out users can't post
    }

    @Test
    @WithMockUser(roles = { "USER" })
    public void logged_in_regular_users_cannot_post() throws Exception {
        mockMvc.perform(post("/api/courses/post"))
                .andExpect(status().is(403)); // only admins can post
    }

    @Test
    @WithMockUser(roles = { "ADMIN", "USER" })
    public void an_admin_user_can_post_a_new_course() throws Exception {

        // arrange
        Course courseBefore = Course.builder()
                .name("CS156")
                .school("UCSB")
                .term("F23")
                .startDate(LocalDateTime.parse("2023-10-11T00:00:00"))
                .endDate(LocalDateTime.parse("2024-11-30T00:00:00"))
                .build();

        when(courseRepository.save(eq(courseBefore)))
                .thenReturn(courseBefore);

        // act
        MvcResult response = mockMvc.perform(
                post("/api/courses/post?name=CS156&school=UCSB&term=F23&startDate=2023-10-11T00:00:00&endDate=2024-11-30T00:00:00")
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(courseRepository, times(1)).save(courseBefore);
        String expectedJson = mapper.writeValueAsString(courseBefore);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }
}
