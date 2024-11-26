package edu.ucsb.cs156.happiercows.controllers;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.testconfig.TestConfig;

import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

@WebMvcTest(controllers = UsersController.class)
@Import(TestConfig.class)
@AutoConfigureDataJpa
public class UsersControllerTests extends ControllerTestCase {

  @MockBean
  UserRepository userRepository;

  @Test
  public void users__logged_out() throws Exception {
    mockMvc.perform(get("/api/admin/users"))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = { "USER" })
  @Test
  public void users__user_logged_in() throws Exception {
    mockMvc.perform(get("/api/admin/users"))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = { "ADMIN" })
  @Test
  public void users__admin_logged_in() throws Exception {

    
    // arrange

    User u1 = User.builder().id(1L).build();
    User u2 = User.builder().id(2L).build();
    User u = currentUserService.getCurrentUser().getUser();

    ArrayList<User> expectedUsers = new ArrayList<>();
    expectedUsers.addAll(Arrays.asList(u1, u2, u));

    when(userRepository.findAll()).thenReturn(expectedUsers);
    String expectedJson = mapper.writeValueAsString(expectedUsers);

    // act

    MvcResult response = mockMvc.perform(get("/api/admin/users"))
        .andExpect(status().isOk()).andReturn();

    // assert

    verify(userRepository, times(1)).findAll();
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);

  }


  @WithMockUser(roles = {"USER"})
  @Test
  public void regular_user_cannot_suspend_user() throws Exception { 
    mockMvc.perform(post("/api/admin/users/suspend")
                .param("userId", "1")
                .with(csrf()))
                .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void regular_user_cannot_restore_user() throws Exception {
    mockMvc.perform(post("/api/admin/users/restore")
                .param("userId", "1")
                .with(csrf()))
                .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_user_can_suspend_user() throws Exception {
    User u1 = User.builder().id(1L).build();
    User user = spy(u1);
    when(userRepository.findById(u1.getId())).thenReturn(Optional.of(user));
    when(userRepository.save(any(User.class))).thenReturn(user);

    MvcResult response = mockMvc.perform(post("/api/admin/users/suspend").param("userId", "1").with(csrf())).andExpect(status().isOk()).andReturn();

    verify(userRepository, times(1)).save(user);
    verify(user, times(1)).setSuspended(true);

    Map<String, Object> json = responseToJson(response);
    assertEquals("User with id 1 suspended", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_user_can_restore_user() throws Exception {
    User u1 = User.builder().id(1L).build();
    User user = spy(u1);
    when(userRepository.findById(u1.getId())).thenReturn(Optional.of(user));
    when(userRepository.save(any(User.class))).thenReturn(user);

    MvcResult response = mockMvc.perform(post("/api/admin/users/restore").param("userId", "1").with(csrf())).andExpect(status().isOk()).andReturn();

    verify(userRepository, times(1)).save(user);
    verify(user, times(1)).setSuspended(false);
    Map<String, Object> json = responseToJson(response);
    assertEquals("User with id 1 restored", json.get("message"));
  }

  @WithMockUser(roles={"ADMIN"})
  @Test
  public void admin_user_cannot_suspend_invalid_user() throws Exception {
    when(userRepository.findById(1L)).thenReturn(Optional.empty());

    mockMvc.perform(post("/api/admin/users/suspend").param("userId", "1").with(csrf())).andExpect(status().isNotFound());
  }

  @WithMockUser(roles={"ADMIN"})
  @Test
  public void admin_user_cannot_restore_invalid_user() throws Exception {
    when(userRepository.findById(1L)).thenReturn(Optional.empty());

    mockMvc.perform(post("/api/admin/users/restore").param("userId", "1").with(csrf())).andExpect(status().isNotFound());
  }
}
