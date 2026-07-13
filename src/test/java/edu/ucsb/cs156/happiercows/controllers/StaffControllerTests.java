package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.Staff;
import edu.ucsb.cs156.happiercows.models.StaffDTO;
import edu.ucsb.cs156.happiercows.repositories.StaffRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.http.MediaType;

import java.util.ArrayList;
import java.util.Optional;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = StaffController.class)
public class StaffControllerTests extends ControllerTestCase {
    @MockBean
    StaffRepository staffRepository;

    @MockBean
    UserRepository userRepository;

    // Logged out users
    @Test
    public void logged_out_users_cannot_get_all() throws Exception {
        mockMvc.perform(get("/api/staff/all"))
                .andExpect(status().is(403));
    }

    @Test
    public void logged_out_users_cannot_get_by_course() throws Exception {
        mockMvc.perform(get("/api/staff/course/1"))
                .andExpect(status().is(403));
    }

    @Test
    public void logged_out_users_cannot_get_by_id() throws Exception {
        mockMvc.perform(get("/api/staff/1"))
                .andExpect(status().is(403));
    }

    @Test
    public void logged_out_users_cannot_post() throws Exception {
        StaffDTO staffDTO = StaffDTO.builder()
                .lastName("Smith")
                .firstMiddleName("Jordan")
                .email("jordansmith@ucsb.edu")
                .courseId(1L)
                .build();

        mockMvc.perform(post("/api/staff")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(staffDTO)))
                .andExpect(status().is(403));
    }

    // Regular users cannot access

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_regular_user_cannot_get_all_staff() throws Exception {
        mockMvc.perform(get("/api/staff/all"))
                .andExpect(status().is(403));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_regular_user_cannot_get_staff_by_id() throws Exception {
        mockMvc.perform(get("/api/staff/1"))
                .andExpect(status().is(403));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_regular_user_cannot_post_staff() throws Exception {
        StaffDTO staffDTO = StaffDTO.builder()
                .lastName("Smith")
                .firstMiddleName("Jordan")
                .email("jordansmith@ucsb.edu")
                .courseId(1L)
                .build();

        mockMvc.perform(post("/api/staff")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(staffDTO)))
                .andExpect(status().is(403));
    }

    // Admin positive tests

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_get_all_staff() throws Exception {
        Staff s1 = Staff.builder()
                .lastName("Smith")
                .firstMiddleName("Jordan")
                .email("jordansmith@ucsb.edu")
                .courseId(1L)
                .build();

        Staff s2 = Staff.builder()
                .lastName("Lee")
                .firstMiddleName("Alex")
                .email("alexlee@ucsb.edu")
                .courseId(1L)
                .build();

        ArrayList<Staff> expectedStaff = new ArrayList<>();
        expectedStaff.add(s1);
        expectedStaff.add(s2);

        when(staffRepository.findAll()).thenReturn(expectedStaff);

        MvcResult response = mockMvc.perform(get("/api/staff/all"))
                .andExpect(status().isOk()).andReturn();

        verify(staffRepository, times(1)).findAll();
        String expectedJson = mapper.writeValueAsString(expectedStaff);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_get_staff_for_a_course() throws Exception {
        Staff s1 = Staff.builder()
                .lastName("Smith")
                .firstMiddleName("Jordan")
                .email("jordansmith@ucsb.edu")
                .courseId(1L)
                .build();

        ArrayList<Staff> expectedStaff = new ArrayList<>();
        expectedStaff.add(s1);

        when(staffRepository.findByCourseId(1L)).thenReturn(expectedStaff);

        MvcResult response = mockMvc.perform(get("/api/staff/course/1"))
                .andExpect(status().isOk()).andReturn();

        verify(staffRepository, times(1)).findByCourseId(1L);
        String expectedJson = mapper.writeValueAsString(expectedStaff);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_get_staff_by_id() throws Exception {
        Staff staff = Staff.builder()
                .id(7L)
                .lastName("Smith")
                .firstMiddleName("Jordan")
                .email("jordansmith@ucsb.edu")
                .courseId(1L)
                .build();

        when(staffRepository.findById(7L)).thenReturn(Optional.of(staff));

        MvcResult response = mockMvc.perform(get("/api/staff/7"))
                .andExpect(status().isOk()).andReturn();

        verify(staffRepository, times(1)).findById(7L);
        String expectedJson = mapper.writeValueAsString(staff);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_cannot_get_staff_when_it_does_not_exist() throws Exception {
        when(staffRepository.findById(7L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/staff/7"))
                .andExpect(status().isNotFound());

        verify(staffRepository, times(1)).findById(7L);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_post_new_staff() throws Exception {
        StaffDTO staffDTO = StaffDTO.builder()
                .lastName("Smith")
                .firstMiddleName("Jordan")
                .email("jordansmith@ucsb.edu")
                .courseId(1L)
                .build();

        Staff staff = Staff.builder()
                .lastName("Smith")
                .firstMiddleName("Jordan")
                .email("jordansmith@ucsb.edu")
                .courseId(1L)
                .build();

        Staff savedStaff = Staff.builder()
                .id(123L)
                .lastName("Smith")
                .firstMiddleName("Jordan")
                .email("jordansmith@ucsb.edu")
                .courseId(1L)
                .build();

        when(staffRepository.save(staff)).thenReturn(savedStaff);

        MvcResult response = mockMvc.perform(post("/api/staff")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(staffDTO)))
                .andExpect(status().isOk()).andReturn();

        verify(staffRepository, times(1)).save(staff);
        String expectedJson = mapper.writeValueAsString(savedStaff);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_delete_a_staff_member() throws Exception {
        Staff staff1 = Staff.builder()
                .lastName("Smith")
                .firstMiddleName("Jordan")
                .email("jordansmith@ucsb.edu")
                .courseId(1L)
                .build();

        when(staffRepository.findById(eq(15L))).thenReturn(Optional.of(staff1));

        MvcResult response = mockMvc
                .perform(delete("/api/staff/15").with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        verify(staffRepository, times(1)).findById(15L);
        verify(staffRepository, times(1)).delete(any());

        Map<String, Object> json = responseToJson(response);
        assertEquals("Staff with id 15 deleted", json.get("message"));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_tries_to_delete_non_existant_staff_and_gets_right_error_message() throws Exception {
        when(staffRepository.findById(eq(15L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc
                .perform(delete("/api/staff/15").with(csrf()))
                .andExpect(status().isNotFound())
                .andReturn();

        verify(staffRepository, times(1)).findById(15L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("Staff with id 15 not found", json.get("message"));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_edit_an_existing_staff_member() throws Exception {
        Staff staffOrig = Staff.builder()
                .lastName("Smith")
                .firstMiddleName("Jordan")
                .email("jordansmith@ucsb.edu")
                .courseId(1L)
                .build();

        StaffDTO staffEditedDTO = StaffDTO.builder()
                .lastName("Smithson")
                .firstMiddleName("Jordy")
                .email("jordysmithson@ucsb.edu")
                .courseId(2L)
                .build();

        Staff staffEdited = Staff.builder()
                .lastName("Smithson")
                .firstMiddleName("Jordy")
                .email("jordysmithson@ucsb.edu")
                .courseId(2L)
                .build();

        String requestBody = mapper.writeValueAsString(staffEditedDTO);

        when(staffRepository.findById(eq(67L))).thenReturn(Optional.of(staffOrig));

        MvcResult response = mockMvc
                .perform(
                        put("/api/staff/67")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("utf-8")
                                .content(requestBody)
                                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        verify(staffRepository, times(1)).findById(67L);
        verify(staffRepository, times(1)).save(staffEdited);
        String responseString = response.getResponse().getContentAsString();
        String expectedJson = mapper.writeValueAsString(staffEdited);
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_cannot_edit_staff_that_does_not_exist() throws Exception {
        StaffDTO staffEditedDTO = StaffDTO.builder()
                .lastName("Smithson")
                .firstMiddleName("Jordy")
                .email("jordysmithson@ucsb.edu")
                .courseId(2L)
                .build();

        String requestBody = mapper.writeValueAsString(staffEditedDTO);

        when(staffRepository.findById(eq(67L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc
                .perform(
                        put("/api/staff/67")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("utf-8")
                                .content(requestBody)
                                .with(csrf()))
                .andExpect(status().isNotFound())
                .andReturn();

        verify(staffRepository, times(1)).findById(67L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("Staff with id 67 not found", json.get("message"));
    }
}
