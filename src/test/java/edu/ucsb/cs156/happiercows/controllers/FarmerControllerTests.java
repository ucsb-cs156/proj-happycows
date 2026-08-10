package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.services.CourseAccessService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = FarmerController.class)
public class FarmerControllerTests extends ControllerTestCase {

    @MockBean
    FarmerRepository farmerRepository;

    @MockBean
    UserRepository userRepository;

    @MockBean
    CommonsRepository commonsRepository;

    @MockBean
    CourseAccessService courseAccessService;

    Commons testCommons = Commons
            .builder()
            .name("test commons")
            .cowPrice(10)
            .milkPrice(2)
            .startingBalance(300)
            .startingDate(LocalDateTime.now())
            .build();

    public Farmer getTestFarmer() {
        return Farmer.builder()
                .user(currentUserService.getUser())
                .commons(testCommons)
                .totalWealth(300)
                .numOfCows(1)
                .cowHealth(100)
                .build();
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void test_getFarmerById_exists_admin() throws Exception {

        Farmer expectedFarmer = getTestFarmer();
        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.of(expectedFarmer));

        MvcResult response = mockMvc.perform(get("/api/farmer?userId=1&commonsId=1"))
                .andExpect(status().isOk()).andReturn();

        verify(farmerRepository, times(1)).findByCommonsIdAndUserId(eq(1L), eq(1L));

        String expectedJson = mapper.writeValueAsString(expectedFarmer);
        String responseString = response.getResponse().getContentAsString();

        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void test_getFarmerById_nonexists_admin() throws Exception {

        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc.perform(get("/api/farmer?userId=1&commonsId=1"))
                .andExpect(status().is(404)).andReturn();

        verify(farmerRepository, times(1)).findByCommonsIdAndUserId(eq(1L), eq(1L));

        String expectedString = "{\"message\":\"Farmer with commonsId 1 and userId 1 not found\",\"type\":\"EntityNotFoundException\"}";

        Map<String, Object> expectedJson = mapper.readValue(expectedString, Map.class);
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_getFarmerById_exists() throws Exception {

        Farmer expectedFarmer = getTestFarmer();
        when(commonsRepository.findById(eq(1L))).thenReturn(Optional.of(testCommons));
        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.of(expectedFarmer));

        MvcResult response = mockMvc.perform(get("/api/farmer/forcurrentuser?commonsId=1"))
                .andExpect(status().isOk()).andReturn();

        verify(commonsRepository, times(1)).findById(eq(1L));
        verify(farmerRepository, times(1)).findByCommonsIdAndUserId(eq(1L), eq(1L));

        String expectedJson = mapper.writeValueAsString(expectedFarmer);
        String responseString = response.getResponse().getContentAsString();

        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_getFarmerById_nonexists() throws Exception {

        when(commonsRepository.findById(eq(1L))).thenReturn(Optional.of(testCommons));
        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc.perform(get("/api/farmer/forcurrentuser?commonsId=1"))
                .andExpect(status().is(404)).andReturn();

        verify(commonsRepository, times(1)).findById(eq(1L));
        verify(farmerRepository, times(1)).findByCommonsIdAndUserId(eq(1L), eq(1L));

        String responseString = response.getResponse().getContentAsString();
        String expectedString = "{\"message\":\"Farmer with commonsId 1 and userId 1 not found\",\"type\":\"EntityNotFoundException\"}";
        Map<String, Object> expectedJson = mapper.readValue(expectedString, Map.class);
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_BuyCow_commons_exists() throws Exception {

        // arrange

        Farmer origFarmer = getTestFarmer();
        origFarmer.setCowsBought(1);

        Farmer updateFarmer = getTestFarmer();
        updateFarmer.setNumOfCows(3);
        updateFarmer.setTotalWealth(300 - (testCommons.getCowPrice() * 2));
        updateFarmer.setCowsBought(3);

        String expectedReturn = mapper.writeValueAsString(updateFarmer);

        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.of(origFarmer));
        when(commonsRepository.findById(eq(1L))).thenReturn(Optional.of(testCommons));

        // act
        MvcResult response = mockMvc.perform(put("/api/farmer/buy?commonsId=1&numCows=2")
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(farmerRepository, times(1)).findByCommonsIdAndUserId(eq(1L), eq(1L));
        verify(farmerRepository, times(1)).save(updateFarmer);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedReturn, responseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_getFarmerById_course_linked_commons_requires_current_enrollment() throws Exception {
        testCommons.setCourseId(17L);
        User currentUser = currentUserService.getUser();

        when(commonsRepository.findById(eq(1L))).thenReturn(Optional.of(testCommons));
        when(courseAccessService.isEligibleForCommons(eq(currentUser), eq(testCommons))).thenReturn(false);

        MvcResult response = mockMvc.perform(get("/api/farmer/forcurrentuser?commonsId=1"))
                .andExpect(status().isForbidden()).andReturn();

        verify(commonsRepository, times(1)).findById(eq(1L));
        verify(courseAccessService, times(1)).isEligibleForCommons(eq(currentUser), eq(testCommons));
        verify(farmerRepository, times(0)).findByCommonsIdAndUserId(anyLong(), anyLong());

        String expectedString = "{\"message\":\"Not enrolled in course associated with game\",\"type\":\"NotEnrolledInCourseAssociatedWithCommonsException\"}";
        Map<String, Object> expectedJson = mapper.readValue(expectedString, Map.class);
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_getFarmerById_course_linked_commons_allows_current_enrollment() throws Exception {
        testCommons.setCourseId(17L);
        User currentUser = currentUserService.getUser();
        Farmer expectedFarmer = getTestFarmer();

        when(commonsRepository.findById(eq(1L))).thenReturn(Optional.of(testCommons));
        when(courseAccessService.isEligibleForCommons(eq(currentUser), eq(testCommons))).thenReturn(true);
        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.of(expectedFarmer));

        MvcResult response = mockMvc.perform(get("/api/farmer/forcurrentuser?commonsId=1"))
                .andExpect(status().isOk()).andReturn();

        verify(commonsRepository, times(1)).findById(eq(1L));
        verify(courseAccessService, times(1)).isEligibleForCommons(eq(currentUser), eq(testCommons));
        verify(farmerRepository, times(1)).findByCommonsIdAndUserId(eq(1L), eq(1L));

        String expectedJson = mapper.writeValueAsString(expectedFarmer);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_getFarmerById_when_commons_does_not_exist() throws Exception {
        when(commonsRepository.findById(eq(1L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc.perform(get("/api/farmer/forcurrentuser?commonsId=1"))
                .andExpect(status().isNotFound()).andReturn();

        verify(commonsRepository, times(1)).findById(eq(1L));
        verify(farmerRepository, times(0)).findByCommonsIdAndUserId(anyLong(), anyLong());

        String expectedString = "{\"message\":\"Game with id 1 not found\",\"type\":\"EntityNotFoundException\"}";
        Map<String, Object> expectedJson = mapper.readValue(expectedString, Map.class);
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_BuyCow_commons_exists_user_has_exact_amount_needed() throws Exception {
        // arrange

        testCommons.setCowPrice(300);

        Farmer origFarmer = getTestFarmer();
        origFarmer.setTotalWealth(300);
        origFarmer.setNumOfCows(1);
        origFarmer.setCowsBought(1);

        Farmer updatedFarmer = getTestFarmer();
        updatedFarmer.setTotalWealth(0);
        updatedFarmer.setNumOfCows(2);
        updatedFarmer.setCowsBought(2);

        String expectedReturn = mapper.writeValueAsString(updatedFarmer);

        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.of(origFarmer));
        when(commonsRepository.findById(eq(1L))).thenReturn(Optional.of(testCommons));

        // act
        MvcResult response = mockMvc.perform(put("/api/farmer/buy?commonsId=1&numCows=1")
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(farmerRepository, times(1)).findByCommonsIdAndUserId(eq(1L), eq(1L));
        verify(farmerRepository, times(1)).save(updatedFarmer);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedReturn, responseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_SellCow_commons_exists() throws Exception {

        // arrange

        Farmer origFarmer = getTestFarmer();
        origFarmer.setCowsSold(1);
        origFarmer.setCowHealth(50);
        origFarmer.setNumOfCows(2);

        Farmer updatedFarmer = getTestFarmer();
        updatedFarmer.setCowHealth(50);
        updatedFarmer.setTotalWealth(300 + (testCommons.getCowPrice() * 0.5 * 2));
        updatedFarmer.setNumOfCows(0);
        updatedFarmer.setCowsSold(3);

        String expectedReturn = mapper.writeValueAsString(updatedFarmer);

        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.of(origFarmer));
        when(commonsRepository.findById(eq(1L))).thenReturn(Optional.of(testCommons));

        // act
        MvcResult response = mockMvc.perform(put("/api/farmer/sell?commonsId=1&numCows=2")
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(farmerRepository, times(1)).findByCommonsIdAndUserId(eq(1L), eq(1L));
        verify(farmerRepository, times(1)).save(updatedFarmer);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedReturn, responseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_buyCow_for_user_not_in_commons() throws Exception {
        when(commonsRepository.findById(234L)).thenReturn(Optional.of(testCommons));
        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.empty());
        // act
        MvcResult response = mockMvc.perform(put("/api/farmer/buy?commonsId=234&numCows=2")
                        .with(csrf()))
                .andExpect(status().is(404)).andReturn();

        // assert

        String expectedString = "{\"message\":\"Farmer with commonsId 234 and userId 1 not found\",\"type\":\"EntityNotFoundException\"}";
        Map<String, Object> expectedJson = mapper.readValue(expectedString, Map.class);
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_buyCow_course_linked_commons_requires_current_enrollment() throws Exception {
        testCommons.setCourseId(17L);
        User currentUser = currentUserService.getUser();

        when(commonsRepository.findById(eq(1L))).thenReturn(Optional.of(testCommons));
        when(courseAccessService.isEligibleForCommons(eq(currentUser), eq(testCommons))).thenReturn(false);

        MvcResult response = mockMvc.perform(put("/api/farmer/buy?commonsId=1&numCows=2")
                        .with(csrf()))
                .andExpect(status().isForbidden()).andReturn();

        verify(courseAccessService, times(1)).isEligibleForCommons(eq(currentUser), eq(testCommons));
        verify(farmerRepository, times(0)).findByCommonsIdAndUserId(anyLong(), anyLong());

        String expectedString = "{\"message\":\"Not enrolled in course associated with game\",\"type\":\"NotEnrolledInCourseAssociatedWithCommonsException\"}";
        Map<String, Object> expectedJson = mapper.readValue(expectedString, Map.class);
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_BuyCow_course_linked_commons_allows_current_enrollment() throws Exception {
        testCommons.setCourseId(17L);
        User currentUser = currentUserService.getUser();

        Farmer origFarmer = getTestFarmer();
        origFarmer.setCowsBought(1);

        Farmer updatedFarmer = getTestFarmer();
        updatedFarmer.setNumOfCows(3);
        updatedFarmer.setTotalWealth(300 - (testCommons.getCowPrice() * 2));
        updatedFarmer.setCowsBought(3);

        when(commonsRepository.findById(eq(1L))).thenReturn(Optional.of(testCommons));
        when(courseAccessService.isEligibleForCommons(eq(currentUser), eq(testCommons))).thenReturn(true);
        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.of(origFarmer));

        MvcResult response = mockMvc.perform(put("/api/farmer/buy?commonsId=1&numCows=2")
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        verify(courseAccessService, times(1)).isEligibleForCommons(eq(currentUser), eq(testCommons));
        verify(farmerRepository, times(1)).save(updatedFarmer);

        String expectedReturn = mapper.writeValueAsString(updatedFarmer);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedReturn, responseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_sellCow_for_user_not_in_commons() throws Exception {
        when(commonsRepository.findById(234L)).thenReturn(Optional.of(testCommons));
        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.empty());

        // act
        MvcResult response = mockMvc.perform(put("/api/farmer/sell?commonsId=234&numCows=2")
                        .with(csrf()))
                .andExpect(status().is(404)).andReturn();

        // assert
        String expectedString = "{\"message\":\"Farmer with commonsId 234 and userId 1 not found\",\"type\":\"EntityNotFoundException\"}";
        Map<String, Object> expectedJson = mapper.readValue(expectedString, Map.class);
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_sellCow_course_linked_commons_requires_current_enrollment() throws Exception {
        testCommons.setCourseId(17L);
        User currentUser = currentUserService.getUser();

        when(commonsRepository.findById(eq(1L))).thenReturn(Optional.of(testCommons));
        when(courseAccessService.isEligibleForCommons(eq(currentUser), eq(testCommons))).thenReturn(false);

        MvcResult response = mockMvc.perform(put("/api/farmer/sell?commonsId=1&numCows=2")
                        .with(csrf()))
                .andExpect(status().isForbidden()).andReturn();

        verify(courseAccessService, times(1)).isEligibleForCommons(eq(currentUser), eq(testCommons));
        verify(farmerRepository, times(0)).findByCommonsIdAndUserId(anyLong(), anyLong());

        String expectedString = "{\"message\":\"Not enrolled in course associated with game\",\"type\":\"NotEnrolledInCourseAssociatedWithCommonsException\"}";
        Map<String, Object> expectedJson = mapper.readValue(expectedString, Map.class);
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_SellCow_course_linked_commons_allows_current_enrollment() throws Exception {
        testCommons.setCourseId(17L);
        User currentUser = currentUserService.getUser();

        Farmer origFarmer = getTestFarmer();
        origFarmer.setCowsSold(1);
        origFarmer.setCowHealth(50);
        origFarmer.setNumOfCows(2);

        Farmer updatedFarmer = getTestFarmer();
        updatedFarmer.setCowHealth(50);
        updatedFarmer.setTotalWealth(300 + (testCommons.getCowPrice() * 0.5 * 2));
        updatedFarmer.setNumOfCows(0);
        updatedFarmer.setCowsSold(3);

        when(commonsRepository.findById(eq(1L))).thenReturn(Optional.of(testCommons));
        when(courseAccessService.isEligibleForCommons(eq(currentUser), eq(testCommons))).thenReturn(true);
        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.of(origFarmer));

        MvcResult response = mockMvc.perform(put("/api/farmer/sell?commonsId=1&numCows=2")
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        verify(courseAccessService, times(1)).isEligibleForCommons(eq(currentUser), eq(testCommons));
        verify(farmerRepository, times(1)).save(updatedFarmer);

        String expectedReturn = mapper.writeValueAsString(updatedFarmer);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedReturn, responseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_buyCow_commons_does_not_exist() throws Exception {
        when(commonsRepository.findById(234L)).thenReturn(Optional.empty());
        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.of(getTestFarmer()));

        // act
        MvcResult response = mockMvc.perform(put("/api/farmer/buy?commonsId=234&numCows=3")
                        .with(csrf()))
                .andExpect(status().is(404)).andReturn();

        // assert
        String expectedString = "{\"message\":\"Game with id 234 not found\",\"type\":\"EntityNotFoundException\"}";
        Map<String, Object> expectedJson = mapper.readValue(expectedString, Map.class);
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_sellCow_commons_does_not_exist() throws Exception {
        when(commonsRepository.findById(234L)).thenReturn(Optional.empty());
        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.of(getTestFarmer()));

        // act
        MvcResult response = mockMvc.perform(put("/api/farmer/sell?commonsId=234&numCows=3")
                        .with(csrf()))
                .andExpect(status().is(404)).andReturn();

        // assert
        String expectedString = "{\"message\":\"Game with id 234 not found\",\"type\":\"EntityNotFoundException\"}";
        Map<String, Object> expectedJson = mapper.readValue(expectedString, Map.class);
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);
    }

    // Put tests for edge cases (not enough money to buy, or no cow to sell)
    @WithMockUser(roles = {"USER"})
    @Test
    public void test_BuyCow_commons_exists_not_enough_money() throws Exception {

        // arrange
        Farmer origFarmer = getTestFarmer();
        origFarmer.setTotalWealth(5);

        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.of(origFarmer));
        when(commonsRepository.findById(eq(1L))).thenReturn(Optional.of(testCommons));

        // act
        MvcResult response = mockMvc.perform(put("/api/farmer/buy?commonsId=1&numCows=1")
                        .with(csrf()))
                .andExpect(status().is(400)).andReturn();

        // assert
        String expectedString = "{\"message\":\"You need more money!\",\"type\":\"NotEnoughMoneyException\"}";
        Map<String, Object> expectedJson = mapper.readValue(expectedString, Map.class);
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_SellCow_commons_exists_no_cow_to_sell() throws Exception {

        // arrange
        Farmer origFarmer = getTestFarmer();
        origFarmer.setNumOfCows(0);

        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.of(origFarmer));
        when(commonsRepository.findById(eq(1L))).thenReturn(Optional.of(testCommons));

        // act
        MvcResult response = mockMvc.perform(put("/api/farmer/sell?commonsId=1&numCows=1")
                .with(csrf())).andExpect(status().is(400)).andReturn();

        // assert
        String expectedString = "{\"message\":\"You do not have enough cows to sell!\",\"type\":\"NoCowsException\"}";
        Map<String, Object> expectedJson = mapper.readValue(expectedString, Map.class);
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);

    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_BuyCow_not_enough_money() throws Exception {

        // arrange
        testCommons.setCowPrice(100);

        Farmer origFarmer = getTestFarmer();
        origFarmer.setCowsBought(1);
        origFarmer.setTotalWealth(100);

        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.of(origFarmer));
        when(commonsRepository.findById(eq(1L))).thenReturn(Optional.of(testCommons));

        // act
        MvcResult response = mockMvc.perform(put("/api/farmer/buy?commonsId=1&numCows=3")
                        .with(csrf()))
                .andExpect(status().is(400)).andReturn();

        // assert
        String expectedString = "{\"message\":\"You need more money!\",\"type\":\"NotEnoughMoneyException\"}";
        Map<String, Object> expectedJson = mapper.readValue(expectedString, Map.class);
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);
    }


    @WithMockUser(roles = {"USER"})
    @Test
    public void test_getAllFarmerById_exists() throws Exception {
        List<Farmer> expectedFarmer = new ArrayList<>();
        Farmer testexpectedFarmer = getTestFarmer();
        expectedFarmer.add(testexpectedFarmer);
        when(farmerRepository.findByCommonsId(eq(1L))).thenReturn(expectedFarmer);

        MvcResult response = mockMvc.perform(get("/api/farmer/commons/all?commonsId=1"))
                .andExpect(status().isOk()).andReturn();

        verify(farmerRepository, times(1)).findByCommonsId(eq(1L));

        String expectedJson = mapper.writeValueAsString(expectedFarmer);
        String responseString = response.getResponse().getContentAsString();

        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void test_Admin_getAllFarmerById_exists() throws Exception {
        List<Farmer> expectedFarmer = new ArrayList<>();
        Farmer testexpectedFarmer = getTestFarmer();
        expectedFarmer.add(testexpectedFarmer);
        when(farmerRepository.findByCommonsId(eq(1L))).thenReturn(expectedFarmer);

        MvcResult response = mockMvc.perform(get("/api/farmer/commons/all?commonsId=1").with(csrf()))
                .andExpect(status().isOk()).andReturn();

        verify(farmerRepository, times(1)).findByCommonsId(eq(1L));

        String expectedJson = mapper.writeValueAsString(expectedFarmer);
        String responseString = response.getResponse().getContentAsString();

        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_BuyCow_hidden_commons() throws Exception {
        // arrange
        testCommons.setHidden(true);
        Farmer origFarmer = getTestFarmer();

        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.of(origFarmer));
        when(commonsRepository.findById(eq(1L))).thenReturn(Optional.of(testCommons));

        // act
        MvcResult response = mockMvc.perform(put("/api/farmer/buy?commonsId=1&numCows=1")
                        .with(csrf()))
                .andExpect(status().is(400)).andReturn();

        // assert
        String expectedString = "{\"message\":\"Game with id 1 is hidden\",\"type\":\"CommonsHiddenException\"}";
        Map<String, Object> expectedJson = mapper.readValue(expectedString, Map.class);
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_SellCow_hidden_commons() throws Exception {
        // arrange
        testCommons.setHidden(true);
        Farmer origFarmer = getTestFarmer();

        when(farmerRepository.findByCommonsIdAndUserId(eq(1L), eq(1L))).thenReturn(Optional.of(origFarmer));
        when(commonsRepository.findById(eq(1L))).thenReturn(Optional.of(testCommons));

        // act
        MvcResult response = mockMvc.perform(put("/api/farmer/sell?commonsId=1&numCows=1")
                        .with(csrf()))
                .andExpect(status().is(400)).andReturn();

        // assert
        String expectedString = "{\"message\":\"Game with id 1 is hidden\",\"type\":\"CommonsHiddenException\"}";
        Map<String, Object> expectedJson = mapper.readValue(expectedString, Map.class);
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);
    }
}
