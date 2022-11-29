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

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void post_cowdeaths_admin_post() throws Exception {
        LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

        UserCommons expectedUserCommons = UserCommons.builder().id(1).commonsId(2).userId(1).build();
        CowDeath expectedCowDeath = CowDeath.builder()
            .id(0)
            .commonsId(2)
            .userId(1)
            .ZonedDateTime(ldt1)
            .cowsKilled(2)
            .avgHealth(4)
            .build();

        when(cowDeathRepository.save(expectedCowDeath)).thenReturn(expectedCowDeath);
        when(userCommonsRepository.findById(1L)).thenReturn(Optional.of(expectedUserCommons));

        MvcResult response = mockMvc.perform(post("/api/cowdeath/admin/post?commonsId=2&ZonedDateTime=2022-01-03T00:00:00&cowsKilled=2&avgHealth=4")
            .with(csrf())).andExpect(status().isOk()).andReturn();

        verify(cowDeathRepository, times(1)).save(expectedCowDeath);

        String expectedJson = mapper.writeValueAsString(expectedCowDeath);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void get_cowdeaths_admin_all_commons() throws Exception {
        List<CowDeath> expectedCowDeaths = new ArrayList<CowDeath>();
        UserCommons uc1 = UserCommons.builder().id(1).commonsId(2).userId(1).build();

        LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

        CowDeath p1 = CowDeath.builder()
            .id(42)
            .commonsId(uc1.getCommonsId())
            .userId(1)
            .ZonedDateTime(ldt1)
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

        UserCommons uc1 = UserCommons.builder().id(1).commonsId(1).userId(2).build();

        LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

        CowDeath p1 = CowDeath.builder()
            .id(0)
            .commonsId(uc1.getCommonsId())
            .userId(2)
            .ZonedDateTime(ldt1)
            .cowsKilled(2)
            .avgHealth(4)
            .build();

        expectedCowDeaths.add(p1);
        when(cowDeathRepository.findAllByCommonsId(1L)).thenReturn(expectedCowDeaths);
        when(userCommonsRepository.findByCommonsIdAndUserId(1L, 2L)).thenReturn(Optional.of(uc1));

        MvcResult response = mockMvc.perform(get("/api/cowdeath/all/byusercommons?commonsId=1&userId=2").contentType("application/json")).andExpect(status().isOk()).andReturn();

        verify(cowDeathRepository, times(1)).findAllByCommonsId(1L);

        String responseString = response.getResponse().getContentAsString();
        List<CowDeath> actualCowDeaths = objectMapper.readValue(responseString, new TypeReference<List<CowDeath>>() {});
        assertEquals(actualCowDeaths, expectedCowDeaths);
    }
        
    }
