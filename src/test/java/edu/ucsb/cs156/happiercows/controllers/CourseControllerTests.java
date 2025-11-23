package edu.ucsb.cs156.happiercows.controllers;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

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

import java.util.ArrayList;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@WebMvcTest(controllers = CourseController.class)
@Import(TestConfig.class)
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

    @WithMockUser(roles = {"USER"})
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

    //Get
    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void admin_can_get_course_by_id() throws Exception {

        Course course = Course.builder()
                .id(1L)
                .code("CMPSC 156")
                .name("Advanced App Programming")
                .term("F24")
                .build();

        when(courseRepository.findById(1L)).thenReturn(java.util.Optional.of(course));

        MvcResult response = mockMvc.perform(get("/api/course/1"))
                .andExpect(status().isOk())
                .andReturn();

        verify(courseRepository, times(1)).findById(1L);

        String expectedJson = mapper.writeValueAsString(course);
        assertEquals(expectedJson, response.getResponse().getContentAsString());
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void admin_get_course_by_id_not_found() throws Exception {

        when(courseRepository.findById(1L)).thenReturn(java.util.Optional.empty());

        mockMvc.perform(get("/api/course/1"))
                .andExpect(status().isNotFound());
    }

    //post
    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void admin_can_create_course() throws Exception {

        Course course = Course.builder()
                .code("CMPSC 148")
                .name("Operating Systems")
                .term("W25")
                .build();

        Course savedCourse = Course.builder()
                .id(1L)
                .code("CMPSC 148")
                .name("Operating Systems")
                .term("W25")
                .build();

        when(courseRepository.save(course)).thenReturn(savedCourse);

        MvcResult response = mockMvc.perform(
                post("/api/course")
                        .with(csrf())
                        .contentType("application/json")
                        .content(mapper.writeValueAsString(course)))
                .andExpect(status().isCreated())
                .andReturn();

        verify(courseRepository, times(1)).save(course);

        String expectedJson = mapper.writeValueAsString(savedCourse);
        assertEquals(expectedJson, response.getResponse().getContentAsString());
    }

    // Put
    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void admin_can_update_course() throws Exception {

        Course originalCourse = Course.builder()
                .id(1L)
                .code("CMPSC 156")
                .name("App Programming")
                .term("F24")
                .build();

        Course updatedCourse = Course.builder()
                .code("CMPSC 156")
                .name("Advanced App Programming")
                .term("F24")
                .build();

        Course savedCourse = Course.builder()
                .id(1L)
                .code("CMPSC 156")
                .name("Advanced App Programming")
                .term("F24")
                .build();

        when(courseRepository.findById(1L)).thenReturn(java.util.Optional.of(originalCourse));
        when(courseRepository.save(any(Course.class))).thenReturn(savedCourse);

        MvcResult response = mockMvc.perform(
                put("/api/course/1")
                        .with(csrf())
                        .contentType("application/json")
                        .content(mapper.writeValueAsString(updatedCourse)))
                .andExpect(status().isOk())
                .andReturn();

        verify(courseRepository, times(1)).findById(1L);
        verify(courseRepository, times(1)).save(any(Course.class));

        String expectedJson = mapper.writeValueAsString(savedCourse);
        assertEquals(expectedJson, response.getResponse().getContentAsString());
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void admin_cannot_update_nonexistent_course() throws Exception {

        Course updatedCourse = Course.builder()
                .code("CMPSC 156")
                .name("Updated Name")
                .term("F24")
                .build();

        when(courseRepository.findById(1L)).thenReturn(java.util.Optional.empty());

        mockMvc.perform(
                put("/api/course/1")
                        .with(csrf())
                        .contentType("application/json")
                        .content(mapper.writeValueAsString(updatedCourse)))
                .andExpect(status().isNotFound());

        verify(courseRepository, times(1)).findById(1L);
    }

    // Delete
    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void admin_can_delete_course() throws Exception {

        when(courseRepository.existsById(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/course/1").with(csrf()))
            .andExpect(status().isNoContent());

        verify(courseRepository, times(1)).existsById(1L);
        verify(courseRepository, times(1)).deleteById(1L);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void admin_cannot_delete_nonexistent_course() throws Exception {

        when(courseRepository.existsById(1L)).thenReturn(false);

        mockMvc.perform(delete("/api/course/1").with(csrf()))
            .andExpect(status().isNotFound());

        verify(courseRepository, times(1)).existsById(1L);
    } 
}
