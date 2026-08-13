package edu.ucsb.cs156.happiercows.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.entities.FarmerActivity;
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.repositories.FarmerActivityRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.services.FarmerActivityService;

@WebMvcTest(controllers = FarmerActivityController.class)
public class FarmerActivityControllerTests extends ControllerTestCase {

    @MockBean
    FarmerActivityRepository farmerActivityRepository;

    @MockBean
    FarmerRepository farmerRepository;

    @MockBean
    GameRepository gameRepository;

    @MockBean
    UserRepository userRepository;

    @MockBean
    FarmerActivityService farmerActivityService;

    Game testGame = Game.builder().id(1L).name("test game").build();

    public Farmer getTestFarmer() {
        return Farmer.builder()
                .user(currentUserService.getUser())
                .game(testGame)
                .build();
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void pageview_records_activity_when_farmer_exists() throws Exception {
        User currentUser = currentUserService.getUser();
        Farmer farmer = getTestFarmer();

        when(gameRepository.findById(eq(1L))).thenReturn(Optional.of(testGame));
        when(farmerRepository.findByGameIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.of(farmer));

        mockMvc.perform(post("/api/farmeractivity/pageview?gameId=1").with(csrf()))
                .andExpect(status().isOk());

        verify(farmerActivityService, times(1)).recordActivityIfStudentMatch(
                eq(currentUser), eq(testGame), eq(farmer),
                eq(FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW), eq(0));
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void pageview_does_not_record_activity_when_farmer_does_not_exist() throws Exception {
        when(gameRepository.findById(eq(1L))).thenReturn(Optional.of(testGame));
        when(farmerRepository.findByGameIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/farmeractivity/pageview?gameId=1").with(csrf()))
                .andExpect(status().isOk());

        verify(farmerActivityService, never()).recordActivityIfStudentMatch(
                any(), any(), any(), anyInt(), anyInt());
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void pageview_returns_404_when_game_does_not_exist() throws Exception {
        when(gameRepository.findById(eq(1L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc.perform(post("/api/farmeractivity/pageview?gameId=1").with(csrf()))
                .andExpect(status().is(404)).andReturn();

        String expectedString = "{\"message\":\"Game with id 1 not found\",\"type\":\"EntityNotFoundException\"}";
        Map<String, Object> expectedJson = mapper.readValue(expectedString, Map.class);
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);

        verify(farmerActivityService, never()).recordActivityIfStudentMatch(
                any(), any(), any(), anyInt(), anyInt());
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void admin_can_get_activity_for_a_farmer() throws Exception {
        Farmer farmer = getTestFarmer();
        FarmerActivity a1 = FarmerActivity.builder()
                .id(1L).farmer(farmer).studentId(42L)
                .timestamp(LocalDateTime.parse("2024-01-15T10:15:30"))
                .activityType(FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW).numCows(0).build();
        FarmerActivity a2 = FarmerActivity.builder()
                .id(2L).farmer(farmer).studentId(42L)
                .timestamp(LocalDateTime.parse("2024-01-15T10:20:00"))
                .activityType(FarmerActivity.ACTIVITY_TYPE_BUY).numCows(3).build();
        List<FarmerActivity> expected = List.of(a2, a1);

        when(farmerRepository.findByGameIdAndUserId(eq(1L), eq(2L))).thenReturn(Optional.of(farmer));
        when(farmerActivityRepository.findByFarmerOrderByTimestampDesc(farmer)).thenReturn(expected);

        MvcResult response = mockMvc.perform(get("/api/farmeractivity/all?userId=2&gameId=1"))
                .andExpect(status().isOk()).andReturn();

        verify(farmerActivityRepository, times(1)).findByFarmerOrderByTimestampDesc(farmer);

        String expectedJson = mapper.writeValueAsString(expected);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void admin_get_activity_for_nonexistent_farmer_returns_404() throws Exception {
        when(farmerRepository.findByGameIdAndUserId(eq(1L), eq(2L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc.perform(get("/api/farmeractivity/all?userId=2&gameId=1"))
                .andExpect(status().is(404)).andReturn();

        String expectedString = "{\"message\":\"Farmer with gameId 1 and userId 2 not found\",\"type\":\"EntityNotFoundException\"}";
        Map<String, Object> expectedJson = mapper.readValue(expectedString, Map.class);
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void non_admin_cannot_get_activity_for_a_farmer() throws Exception {
        mockMvc.perform(get("/api/farmeractivity/all?userId=2&gameId=1"))
                .andExpect(status().isForbidden());
    }
}
