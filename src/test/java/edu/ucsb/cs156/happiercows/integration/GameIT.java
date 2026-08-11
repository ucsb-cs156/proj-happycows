package edu.ucsb.cs156.happiercows.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import org.junit.jupiter.api.Test;
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

import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.models.CreateGameParams;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.services.CurrentUserService;
import edu.ucsb.cs156.happiercows.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.happiercows.testconfig.TestConfig;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class GameIT {
    @Autowired
    public CurrentUserService currentUserService;

    @Autowired
    public GrantedAuthoritiesService grantedAuthoritiesService;

    @Autowired
    GameRepository gameRepository;

    @Autowired
    public MockMvc mockMvc;

    @Autowired
    public ObjectMapper mapper;

    @MockBean
    UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @WithMockUser(roles = {"USER"})
    @Test
    public void getGameTest() throws Exception {
        List<Game> expectedGame = new ArrayList<Game>();
        Game Game1 = Game.builder()
                .name("TestGame1")
                .startingDate(LocalDateTime.parse("2022-03-05T15:50:10"))
                .lastDate(LocalDateTime.parse("2022-07-05T15:50:10"))
                .build();
        expectedGame.add(Game1);

        gameRepository.save(Game1);
        
        MvcResult response = mockMvc.perform(get("/api/game/all").contentType("application/json"))
                .andExpect(status().isOk()).andReturn();

        String responseString = response.getResponse().getContentAsString();
        List<Game> actualGame = objectMapper.readValue(responseString, new TypeReference<List<Game>>() {
        });
        assertEquals(actualGame, expectedGame);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void newGameDefaultsToHiddenSectionsAndChat() throws Exception {
        CreateGameParams parameters = CreateGameParams.builder()
                .name("Test Game For Defaults")
                .cowPrice(10.0)
                .milkPrice(1.0)
                .startingBalance(100.0)
                .startingDate(LocalDateTime.parse("2022-03-05T15:50:10"))
                .lastDate(LocalDateTime.parse("2022-07-05T15:50:10"))
                .degradationRate(1.0)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .build();

        String requestBody = objectMapper.writeValueAsString(parameters);

        mockMvc.perform(post("/api/game/new").with(csrf())
                        .contentType("application/json")
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isOk());

        Game saved = gameRepository.findAll().iterator().next();

        assertFalse(saved.isShowChat());
        assertFalse(saved.isShowOverviewSection());
        assertFalse(saved.isShowCowsPerFarmerSection());
        assertFalse(saved.isShowHistogramSection());
        assertFalse(saved.isShowTrendsSection());
        assertFalse(saved.isShowHealthSection());
        assertFalse(saved.isShowTotalCowsSection());
        assertFalse(saved.isShowFarmerLeaderboardSection());
    }
}