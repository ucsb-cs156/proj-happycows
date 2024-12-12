package edu.ucsb.cs156.happiercows.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;


import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.models.CreateCommonsParams;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.services.CurrentUserService;
import edu.ucsb.cs156.happiercows.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.happiercows.testconfig.TestConfig;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class CommonsIT {
    @Autowired
    public CurrentUserService currentUserService;

    @Autowired
    public GrantedAuthoritiesService grantedAuthoritiesService;

    @Autowired
    CommonsRepository commonsRepository;

    @Autowired
    public MockMvc mockMvc;

    @Autowired
    public ObjectMapper mapper;

    @MockBean
    UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @WithMockUser(roles = { "USER" })
    @Test
    public void getCommonsTest() throws Exception {
        List<Commons> expectedCommons = new ArrayList<Commons>();
        Commons Commons1 = Commons.builder().name("TestCommons1").build();
        expectedCommons.add(Commons1);

        commonsRepository.save(Commons1);

        MvcResult response = mockMvc.perform(get("/api/commons/all").contentType("application/json"))
                .andExpect(status().isOk()).andReturn();

        String responseString = response.getResponse().getContentAsString();
        List<Commons> actualCommons = objectMapper.readValue(responseString, new TypeReference<List<Commons>>() {
        });
        assertEquals(actualCommons, expectedCommons);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_post_a_new_commons() throws Exception {
        // Arrange
        CreateCommonsParams commons = CreateCommonsParams.builder()
                .name("TestCommons")
                .startingBalance(10000)
                .cowPrice(100)
                .milkPrice(1)
                .degradationRate(0.001)
                .carryingCapacity(100)
                .capacityPerUser(50)
                .startingDate(LocalDateTime.parse("2024-11-25T00:00:00"))
                .lastDate(LocalDateTime.parse("2024-12-25T00:00:00"))
                .aboveCapacityHealthUpdateStrategy("Linear")
                .belowCapacityHealthUpdateStrategy("Linear")
                .showLeaderboard(false)
                .showChat(false)
                .build();

        String requestBody = mapper.writeValueAsString(commons);

        // Act
        MvcResult response = mockMvc.perform(
                post("/api/commons/new")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk()).andReturn();

        String responseString = response.getResponse().getContentAsString();
        Commons actualCommons = mapper.readValue(responseString, Commons.class);

        assertEquals("TestCommons", actualCommons.getName());
        assertEquals(10000, actualCommons.getStartingBalance());
        assertEquals(100.0, actualCommons.getCowPrice());
        assertEquals(1.0, actualCommons.getMilkPrice());
        assertEquals(0.001, actualCommons.getDegradationRate());
        assertEquals(100, actualCommons.getCarryingCapacity());
        assertEquals(50, actualCommons.getCapacityPerUser());
        assertEquals(LocalDateTime.parse("2024-11-25T00:00:00"), actualCommons.getStartingDate());
        assertEquals(LocalDateTime.parse("2024-12-25T00:00:00"), actualCommons.getLastDate());
        assertEquals(false, actualCommons.isShowLeaderboard());
        assertEquals(false, actualCommons.isShowChat());
    }
}