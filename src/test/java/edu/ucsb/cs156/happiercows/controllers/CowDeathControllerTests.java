package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.repositories.ProfitRepository;
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

    /*
    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void get_profits_admin() throws Exception {

    List<CowDeath> testCowDeaths = new ArrayList<CowDeath>();

    UserCommons uc1 = UserCommons.builder().id(1).commonsId(2).userId(1).build();
    UserCommons uc2 = UserCommons.builder().id(1).commonsId(2).userId(2).build();

    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");
    LocalDateTime ldt2 = LocalDateTime.parse("2021-01-03T00:00:00");


    CowDeath p1 = CowDeath.builder()
        .id(42)
        .commonsId(uc1.getCommonsId())
        .userId(1)
        .ZonedDateTime(ldt1)
        .cowsKilled(2)
        .avgHealth(4)
        .build();

    CowDeath p2 = CowDeath.builder()
        .id(43)
        .commonsId(uc2.getCommonsId())
        .userId(1)
        .ZonedDateTime(ldt2)
        .cowsKilled(8)
        .avgHealth(1)
        .build();

    CowDeath p3 = CowDeath.builder()
        .id(44)
        .commonsId(uc2.getCommonsId())
        .userId(2)
        .ZonedDateTime(ldt2)
        .cowsKilled(6)
        .avgHealth(7)
        .build();
   
    testCowDeaths.add(p1);
    testCowDeaths.add(p2);
    testCowDeaths.add(p3);
    when(cowDeathRepository.findAll()).thenReturn(testCowDeaths);

    MvcResult response = mockMvc.perform(get("/api/cowdeaths/admin/all")).andExpect(status().isOk()).andReturn();
    
    verify(cowDeathRepository, times(1)).findAll();
    
    String responseString = response.getResponse().getContentAsString();
    List<CowDeath> actualCowDeaths = objectMapper.readValue(responseString, new TypeReference<List<CowDeath>>() {});
    assertEquals(actualCowDeaths, testCowDeaths);
  }*/

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

    MvcResult response = mockMvc.perform(post("/api/cowdeaths/admin/post?commonsId=2&ZonedDateTime=2022-01-03T00:00:00&cowsKilled=2&avgHealth=4")
        .with(csrf())).andExpect(status().isOk()).andReturn();

    verify(cowDeathRepository, times(1)).save(expectedCowDeath);

    String expectedJson = mapper.writeValueAsString(expectedCowDeath);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = { "ADMIN" })
  @Test
  public void get_profits_admin_all_commons() throws Exception {
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

    MvcResult response = mockMvc.perform(get("/api/cowdeaths/admin/all/commons?commonsId=1").contentType("application/json")).andExpect(status().isOk()).andReturn();

    verify(cowDeathRepository, times(1)).findAllByCommonsId(1L);

    String responseString = response.getResponse().getContentAsString();
    List<CowDeath> actualCowDeaths = objectMapper.readValue(responseString, new TypeReference<List<CowDeath>>() {});
    assertEquals(actualCowDeaths, expectedCowDeaths);
  }
    
}
