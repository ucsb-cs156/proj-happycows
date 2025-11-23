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

import java.util.ArrayList;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;
import java.util.Map;
import org.springframework.http.MediaType;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;



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


//START EDITING FROM HERE 
    @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc.perform(post("/api/course")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_post() throws Exception {
    mockMvc
        .perform(post("/api/course"))
        .andExpect(status().is(403)); // only admins can post
  }


  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_course() throws Exception {
    // arrange

    Course course1 =
        Course.builder()
            .code("CMPSC156")
            .name("AdvancedApplicationProgramming")
            .term("F25")
            .build();

    when(courseRepository.save(eq(course1))).thenReturn(course1);

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/course?code=CMPSC156&name=AdvancedApplicationProgramming&term=F25")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(courseRepository, times(1)).save(eq(course1));
    String expectedJson = mapper.writeValueAsString(course1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  public void logged_out_users_cannot_get_by_id() throws Exception {
    mockMvc
        .perform(get("/api/course?id=7"))
        .andExpect(status().is(403)); // logged out users can't get by id
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {

    // arrange
     Course course1 =
        Course.builder()
            .code("CMPSC156")
            .name("AdvancedApplicationProgramming")
            .term("F25")
            .build();

    when(courseRepository.findById(eq(7L))).thenReturn(Optional.of(course1));

    // act
    MvcResult response =
        mockMvc.perform(get("/api/course?id=7")).andExpect(status().isOk()).andReturn();

    // assert

    verify(courseRepository, times(1)).findById(eq(7L));
    String expectedJson = mapper.writeValueAsString(course1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {

    // arrange

    when(courseRepository.findById(eq(7L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc.perform(get("/api/course?id=7")).andExpect(status().isNotFound()).andReturn();

    // assert

    verify(courseRepository, times(1)).findById(eq(7L));
    Map<String, Object> json = responseToJson(response);
    assertEquals("EntityNotFoundException", json.get("type"));
    assertEquals("Course with id 7 not found", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_edit_an_existing_course() throws Exception {
    // arrange

    Course course =
        Course.builder()
            .code("CMPSC156")
            .name("AdvancedApplicationProgramming")
            .term("F25")
            .build();
    
    Course editedCourse =
        Course.builder()
            .code("CMPSC154")
            .name("AdvancedApplicationProgrammingEdited")
            .term("F24")
            .build();


    String requestBody = mapper.writeValueAsString(editedCourse);

    when(courseRepository.findById(eq(67L))).thenReturn(Optional.of(course));

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/course?id=67")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(courseRepository, times(1)).findById(67L);
    verify(courseRepository, times(1))
        .save(editedCourse); // should be saved with correct user
    String responseString = response.getResponse().getContentAsString();
    assertEquals(requestBody, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_cannot_edit_course_that_does_not_exist() throws Exception {
    // arrange

    Course course =
        Course.builder()
            .code("CMPSC156")
            .name("AdvancedApplicationProgramming")
            .term("F25")
            .build();

    String requestBody = mapper.writeValueAsString(course);

    when(courseRepository.findById(eq(67L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/course?id=67")
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

    Course course =
        Course.builder()
            .code("CMPSC156")
            .name("AdvancedApplicationProgramming")
            .term("F25")
            .build();

    when(courseRepository.findById(eq(15L))).thenReturn(Optional.of(course));

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/course?id=15").with(csrf()))
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
  public void admin_tries_to_delete_non_existant_course_and_gets_right_error_message()
      throws Exception {
    // arrange

    when(courseRepository.findById(eq(15L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/course?id=15").with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    verify(courseRepository, times(1)).findById(15L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("Course with id 15 not found", json.get("message"));
  }
}
