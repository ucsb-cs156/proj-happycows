package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.CowDeathRepository;
import edu.ucsb.cs156.happiercows.repositories.UserCommonsRepository;
import edu.ucsb.cs156.happiercows.entities.CowDeath;
import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.UserCommons;
import java.time.LocalDateTime;



import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.Optional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.ZonedDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.parameters.P;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.http.MediaType;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import org.springframework.beans.factory.annotation.Autowired;
import edu.ucsb.cs156.happiercows.testconfig.TestConfig;

@WebMvcTest(controllers = CowDeathController.class)
@Import(CowDeathController.class)
@AutoConfigureDataJpa

public class CowDeathControllerTests extends ControllerTestCase {
    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    CowDeathRepository cowDeathRepository;

    @MockBean
    UserCommonsRepository userCommonsRepository;

    @MockBean
    UserRepository userRepository;

    @MockBean
    CommonsRepository commonsRepository;

    private LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
    private LocalDateTime someOtherTime = LocalDateTime.parse("2022-04-20T15:50:10");

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void post_cowdeaths_admin_post() throws Exception {

       
        UserCommons expectedUserCommons = UserCommons.builder().id(1).commonsId(2).userId(17).build();
        CowDeath expectedCowDeath = CowDeath.builder()
            .id(0)
            .commonsId(2)
            .userId(17)
            .createdAt(null)
            .cowsKilled(2)
            .avgHealth(4)
            .build();

        Commons common1 = Commons.builder()
            .name("Jackson's Commons")
            .cowPrice(500.99)
            .milkPrice(8.99)
            .startingBalance(1020.10)
            .startingDate(someTime)
            .endingDate(someOtherTime)
            .degradationRate(50.0)
            .showLeaderboard(false)
            .build();

        User user1 = User.builder()
            .givenName("Chris")
            .familyName("Gaucho")
            .fullName("Chris Gaucho")
            .admin(false)
            .email("cgaucho@example.org")
            .build();

        when(cowDeathRepository.save(expectedCowDeath)).thenReturn(expectedCowDeath);
        when(userCommonsRepository.findById(1L)).thenReturn(Optional.of(expectedUserCommons));
        when(commonsRepository.findById(2L)).thenReturn(Optional.of(common1));
        when(userRepository.findById(17L)).thenReturn(Optional.of(user1));

        MvcResult response = mockMvc.perform(post("/api/cowdeath/admin/post?commonsId=2&userId=17&cowsKilled=2&avgHealth=4")
            .with(csrf())).andExpect(status().isOk()).andReturn();

        verify(cowDeathRepository, times(1)).save(expectedCowDeath);

        String expectedJson = mapper.writeValueAsString(expectedCowDeath);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void post_cowdeaths_nonexistent_user_admin_post() throws Exception {

        ZonedDateTime ldt1 = ZonedDateTime.parse("2016-10-05T08:20:10+05:30[UTC]");

        UserCommons expectedUserCommons = UserCommons.builder().id(1).commonsId(2).userId(1).build();
        Commons common1 = Commons.builder()
        .name("Jackson's Commons")
        .cowPrice(500.99)
        .milkPrice(8.99)
        .startingBalance(1020.10)
        .startingDate(someTime)
        .endingDate(someOtherTime)
        .degradationRate(50.0)
        .showLeaderboard(false)
        .build();
        
        CowDeath expectedCowDeath = CowDeath.builder()
            .id(0)
            .commonsId(2)
            .userId(1)
            .createdAt(ldt1)
            .cowsKilled(2)
            .avgHealth(4)
            .build();

        when(cowDeathRepository.save(expectedCowDeath)).thenReturn(expectedCowDeath);
        when(userCommonsRepository.findById(1L)).thenReturn(Optional.of(expectedUserCommons));
        when(commonsRepository.findById(2L)).thenReturn(Optional.of(common1));

        MvcResult response = mockMvc.perform(post("/api/cowdeath/admin/post?commonsId=2&userId=17&cowsKilled=2&avgHealth=4")
            .with(csrf())).andExpect(status().isNotFound()).andReturn();

        verify(commonsRepository, times(1)).findById(2L);

        Map<String, Object> json = responseToJson(response);

        assertEquals("EntityNotFoundException", json.get("type"));
        assertEquals("User with id 17 not found", json.get("message"));    
    
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void post_cowdeaths_nonexistent_commons_admin_post() throws Exception {

        ZonedDateTime ldt1 = ZonedDateTime.parse("2016-10-05T08:20:10+05:30[UTC]");

        UserCommons expectedUserCommons = UserCommons.builder().id(1).commonsId(2).userId(17).build();
        CowDeath expectedCowDeath = CowDeath.builder()
            .id(0)
            .commonsId(2)
            .userId(1)
            .createdAt(ldt1)
            .cowsKilled(2)
            .avgHealth(4)
            .build();

        when(cowDeathRepository.save(expectedCowDeath)).thenReturn(expectedCowDeath);
        when(userCommonsRepository.findById(1L)).thenReturn(Optional.of(expectedUserCommons));

        MvcResult response = mockMvc.perform(post("/api/cowdeath/admin/post?commonsId=2&userId=17&cowsKilled=2&avgHealth=4")
            .with(csrf())).andExpect(status().isNotFound()).andReturn();

        verify(commonsRepository, times(1)).findById(2L);

        Map<String, Object> json = responseToJson(response);

        assertEquals("EntityNotFoundException", json.get("type"));
        assertEquals("Commons with id 2 not found", json.get("message"));
    }


    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void get_cowdeaths_admin_all_commons() throws Exception {
        List<CowDeath> expectedCowDeaths = new ArrayList<CowDeath>();
        UserCommons uc1 = UserCommons.builder().id(1).commonsId(2).userId(1).build();

        ZonedDateTime ldt1 = ZonedDateTime.parse("2016-10-05T08:20:10+05:30[UTC]");

        CowDeath p1 = CowDeath.builder()
            .id(42)
            .commonsId(uc1.getCommonsId())
            .userId(1)
            .createdAt(ldt1)
            .cowsKilled(2)
            .avgHealth(4)
            .build();

        expectedCowDeaths.add(p1);
        when(cowDeathRepository.findAllByCommonsId(1L)).thenReturn(expectedCowDeaths);

        MvcResult response = mockMvc.perform(get("/api/cowdeath/admin/all/bycommons?commonsId=1").contentType("application/json")).andExpect(status().isOk()).andReturn();

        verify(cowDeathRepository, times(1)).findAllByCommonsId(1L);

        String responseString = response.getResponse().getContentAsString();
        List<CowDeath> actualCowDeaths = objectMapper.readValue(responseString, new TypeReference<List<CowDeath>>() {});
        assertEquals(actualCowDeaths, expectedCowDeaths);
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void get_cowdeaths_admin_all_by_user_commons() throws Exception {
        List<CowDeath> expectedCowDeaths = new ArrayList<CowDeath>();

        UserCommons uc1 = UserCommons.builder().id(1).commonsId(1).userId(1).build();

        ZonedDateTime ldt1 = ZonedDateTime.parse("2016-10-05T08:20:10+05:30[UTC]");

        CowDeath p1 = CowDeath.builder()
            .id(0)
            .commonsId(uc1.getCommonsId())
            .userId(1)
            .createdAt(ldt1)
            .cowsKilled(2)
            .avgHealth(4)
            .build();

        expectedCowDeaths.add(p1);
        when(cowDeathRepository.findAllByCommonsIdAndUserId(1L, 1L)).thenReturn(expectedCowDeaths);
        when(userCommonsRepository.findByCommonsIdAndUserId(1L, 1L)).thenReturn(Optional.of(uc1));

        MvcResult response = mockMvc.perform(get("/api/cowdeath/all/byUser?commonsId=1").contentType("application/json")).andExpect(status().isOk()).andReturn();

        verify(cowDeathRepository, times(1)).findAllByCommonsIdAndUserId(1L, 1L);
        verify(userCommonsRepository, times(1)).findByCommonsIdAndUserId(1L,1L);

        String responseString = response.getResponse().getContentAsString();
        List<CowDeath> actualCowDeaths = objectMapper.readValue(responseString, new TypeReference<List<CowDeath>>() {});
        assertEquals(expectedCowDeaths, actualCowDeaths);
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void get_cowdeaths_admin_all_nonexistent_by_user_commons() throws Exception {
        MvcResult response = mockMvc.perform(get("/api/cowdeath/all/byUser?commonsId=2").contentType("application/json")).andExpect(status().isNotFound()).andReturn();

        verify(userCommonsRepository, times(1)).findByCommonsIdAndUserId(2L,1L);

        Map<String, Object> json = responseToJson(response);
        assertEquals("EntityNotFoundException", json.get("type"));
        assertEquals("UserCommons with commonsId 2 and userId 1 not found", json.get("message"));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void get_cowdeaths_admin_all_incorrect_userid__by_user_commons() throws Exception {
        List<CowDeath> expectedCowDeaths = new ArrayList<CowDeath>();

        UserCommons uc1 = UserCommons.builder().id(1).commonsId(2).userId(2).build();

        ZonedDateTime ldt1 = ZonedDateTime.parse("2016-10-05T08:20:10+05:30[UTC]");

        CowDeath p1 = CowDeath.builder()
            .id(0)
            .commonsId(uc1.getCommonsId())
            .userId(2)
            .createdAt(ldt1)
            .cowsKilled(2)
            .avgHealth(4)
            .build();

        expectedCowDeaths.add(p1);
        when(cowDeathRepository.findAllByCommonsIdAndUserId(1L, 1L)).thenReturn(expectedCowDeaths);
        when(userCommonsRepository.findByCommonsIdAndUserId(2L,1L)).thenReturn(Optional.of(uc1));

        MvcResult response = mockMvc.perform(get("/api/cowdeath/all/byUser?commonsId=2").contentType("application/json")).andExpect(status().isNotFound()).andReturn();

        verify(userCommonsRepository, times(1)).findByCommonsIdAndUserId(2L,1L);

        Map<String, Object> json = responseToJson(response);
        assertEquals("EntityNotFoundException", json.get("type"));
        assertEquals("UserCommons with id 1 not found", json.get("message"));
    }
        
    }
