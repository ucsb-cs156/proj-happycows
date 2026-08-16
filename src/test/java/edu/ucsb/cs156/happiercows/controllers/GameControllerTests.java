package edu.ucsb.cs156.happiercows.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.GamePlus;
import edu.ucsb.cs156.happiercows.entities.GameStats;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.models.CreateGameParams;
import edu.ucsb.cs156.happiercows.models.DashboardSettingsParams;
import edu.ucsb.cs156.happiercows.models.HealthUpdateStrategyList;
import edu.ucsb.cs156.happiercows.repositories.GameStatsRepository;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.services.GamePlusBuilderService;
import edu.ucsb.cs156.happiercows.services.CourseAccessService;
import edu.ucsb.cs156.happiercows.strategies.CowHealthUpdateStrategies;

@WebMvcTest(controllers = GameController.class)
public class GameControllerTests extends ControllerTestCase {

    @MockBean
    FarmerRepository farmerRepository;

    @MockBean
    UserRepository userRepository;

    @MockBean
    GameRepository gameRepository;

    @MockBean
    GamePlusBuilderService gamePlusBuilderService;

    @MockBean
    GameStatsRepository gameStatsRepository;

    @MockBean
    CourseAccessService courseAccessService;

    @Autowired
    private ObjectMapper objectMapper;

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void getDefaultGameValuesTest() throws Exception {
        Map<String, Object> expectedDefaults = Map.of(
                "id", 0,
                "name", "null",
                "cowPrice", 100.0,
                "milkPrice", 1.0,
                "startingBalance", 10000.0,
                "degradationRate", 0.001,
                "carryingCapacity", 100,
                "capacityPerUser", 50,
                "aboveCapacityHealthUpdateStrategy", "Linear",
                "belowCapacityHealthUpdateStrategy", "Constant"
        );

        MvcResult response = mockMvc
                .perform(get("/api/game/defaults").with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> actualDefaults = objectMapper.readValue(
                response.getResponse().getContentAsString(),
                new TypeReference<Map<String, Object>>() {});

        assertEquals(expectedDefaults.get("id"), actualDefaults.get("id"));
        assertEquals(expectedDefaults.get("cowPrice"), actualDefaults.get("cowPrice"));
        assertEquals(expectedDefaults.get("milkPrice"), actualDefaults.get("milkPrice"));
        assertEquals(expectedDefaults.get("startingBalance"), actualDefaults.get("startingBalance"));
        assertEquals(expectedDefaults.get("degradationRate"), actualDefaults.get("degradationRate"));
        assertEquals(expectedDefaults.get("carryingCapacity"), actualDefaults.get("carryingCapacity"));
        assertEquals(expectedDefaults.get("capacityPerUser"), actualDefaults.get("capacityPerUser"));
        assertEquals(expectedDefaults.get("aboveCapacityHealthUpdateStrategy"), actualDefaults.get("aboveCapacityHealthUpdateStrategy"));
        assertEquals(expectedDefaults.get("belowCapacityHealthUpdateStrategy"), actualDefaults.get("belowCapacityHealthUpdateStrategy"));
        assertEquals(false, actualDefaults.get("hidden"));
    }


    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void createGameTest() throws Exception {
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        LocalDateTime someLaterTime = LocalDateTime.parse("2022-07-05T15:50:10");

        Game game = Game.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Constant)
                .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear)
                .hidden(false)
                .build();

        CreateGameParams parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Constant.name())
                .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear.name())
                .hidden(false)
                .build();

        String requestBody = objectMapper.writeValueAsString(parameters);
        String expectedResponse = objectMapper.writeValueAsString(game);

        when(gameRepository.save(game))
                .thenReturn(game);

        MvcResult response = mockMvc
                .perform(post("/api/game/new").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        verify(gameRepository, times(1)).save(game);

        String actualResponse = response.getResponse().getContentAsString();
        assertEquals(expectedResponse, actualResponse);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void createGameTest_withCourseId() throws Exception {
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        LocalDateTime someLaterTime = LocalDateTime.parse("2022-07-05T15:50:10");

        Game game = Game.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Constant)
                .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear)
                .hidden(false)
                .courseId(5L)
                .build();

        CreateGameParams parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Constant.name())
                .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear.name())
                .hidden(false)
                .courseId(5L)
                .build();

        String requestBody = objectMapper.writeValueAsString(parameters);
        String expectedResponse = objectMapper.writeValueAsString(game);

        when(gameRepository.save(game))
                .thenReturn(game);

        MvcResult response = mockMvc
                .perform(post("/api/game/new").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        verify(gameRepository, times(1)).save(game);

        String actualResponse = response.getResponse().getContentAsString();
        assertEquals(expectedResponse, actualResponse);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void createGameTest_withNoCowHealthUpdateStrategies() throws Exception {
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        LocalDateTime someLaterTime = LocalDateTime.parse("2022-07-05T15:50:10");

        Game game = Game.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .hidden(false)
                .build();

        CreateGameParams parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .hidden(false)
                .build();

        // don't include null values to simulate old frontend
        var mapperWithoutNulls = objectMapper.copy().setSerializationInclusion(JsonInclude.Include.NON_NULL);
        String requestBody = mapperWithoutNulls.writeValueAsString(parameters);

        String expectedResponse = objectMapper.writeValueAsString(game);

        when(gameRepository.save(game))
                .thenReturn(game);

        MvcResult response = mockMvc
                .perform(post("/api/game/new").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        verify(gameRepository, times(1)).save(game);

        String actualResponse = response.getResponse().getContentAsString();
        assertEquals(expectedResponse, actualResponse);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void createGameTest_zeroDegradation() throws Exception {
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        LocalDateTime someLaterTime = LocalDateTime.parse("2022-07-05T15:50:10");

        Game game = Game.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(0)
                .showLeaderboard(false)
                .showChat(true)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .hidden(false)
                .build();

        CreateGameParams parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(0)
                .showLeaderboard(false)
                .showChat(true)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .hidden(false)
                .build();

        String requestBody = objectMapper.writeValueAsString(parameters);
        String expectedResponse = objectMapper.writeValueAsString(game);

        when(gameRepository.save(game))
                .thenReturn(game);

        MvcResult response = mockMvc
                .perform(post("/api/game/new").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        verify(gameRepository, times(1)).save(game);

        String actualResponse = response.getResponse().getContentAsString();
        assertEquals(expectedResponse, actualResponse);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void createGameTest_withIllegalDegradationRate() throws Exception {
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        LocalDateTime someLaterTime = LocalDateTime.parse("2022-07-05T15:50:10");

        Game game = Game.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(-8.49)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .hidden(false)
                .build();

        CreateGameParams parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(-8.49)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .hidden(false)
                .build();

        String requestBody = objectMapper.writeValueAsString(parameters);

        when(gameRepository.save(game))
                .thenReturn(game);

        MvcResult response = mockMvc
                .perform(post("/api/game/new").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest()).andReturn();

        assertInstanceOf(IllegalArgumentException.class, response.getResolvedException());
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void getGameTest() throws Exception {
        List<Game> expectedGame = new ArrayList<Game>();
        Game Game1 = Game.builder().name("TestGame1").build();

        expectedGame.add(Game1);
        when(gameRepository.findAll()).thenReturn(expectedGame);
        MvcResult response = mockMvc.perform(get("/api/game/all").contentType("application/json"))
                .andExpect(status().isOk()).andReturn();

        verify(gameRepository, times(1)).findAll();

        String responseString = response.getResponse().getContentAsString();
        List<Game> actualGame = objectMapper.readValue(responseString, new TypeReference<List<Game>>() {
        });
        assertEquals(actualGame, expectedGame);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void updateGameTest_setsCourseId() throws Exception {
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        LocalDateTime someLaterTime = LocalDateTime.parse("2022-07-05T15:50:10");

        CreateGameParams parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(50.0)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .hidden(false)
                .courseId(5L)
                .build();

        // A distinct object instance from the one that will be saved, so
        // that the courseId assertion below cannot trivially pass by
        // comparing the mutable "existing" object to itself.
        Game existing = Game.builder()
                .id(0L)
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(50.0)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .hidden(false)
                .courseId(null)
                .build();

        when(gameRepository.findById(0L)).thenReturn(Optional.of(existing));

        String requestBody = objectMapper.writeValueAsString(parameters);

        mockMvc
                .perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isNoContent());

        ArgumentCaptor<Game> captor = ArgumentCaptor.forClass(Game.class);
        verify(gameRepository, times(1)).save(captor.capture());
        assertEquals(5L, captor.getValue().getCourseId());
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void updateGameTest() throws Exception {
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        LocalDateTime someLaterTime = LocalDateTime.parse("2022-07-05T15:50:10");

        CreateGameParams parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .showChat(true)
                .degradationRate(50.0)
                .showLeaderboard(true)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Constant.name())
                .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear.name())
                .hidden(false)
                .build();

        Game game = Game.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .showChat(true)
                .degradationRate(50.0)
                .showLeaderboard(true)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Constant)
                .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear)
                .hidden(false)
                .build();

        String requestBody = objectMapper.writeValueAsString(parameters);

        when(gameRepository.save(game))
                .thenReturn(game);

        mockMvc
                .perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isCreated());

        verify(gameRepository, times(1)).save(game);
                when(gameRepository.findById(0L))
                .thenReturn(Optional.of(game));

        // When we look up the game it should have the values from "before" the update
        when(gameRepository.findById(0L))
                .thenReturn(Optional.of(game));

        parameters.setMilkPrice(parameters.getMilkPrice() + 3.00);
        game.setMilkPrice(parameters.getMilkPrice());
        parameters.setDegradationRate(parameters.getDegradationRate() + 1.00);
        game.setDegradationRate(parameters.getDegradationRate());
        parameters.setShowLeaderboard(false);
        game.setShowLeaderboard(parameters.getShowLeaderboard());
        parameters.setShowChat(false);
        game.setShowChat(parameters.getShowChat());
        parameters.setCapacityPerUser(12);
        game.setCapacityPerUser(parameters.getCapacityPerUser());
        parameters.setCarryingCapacity(123);
        game.setCarryingCapacity(parameters.getCarryingCapacity());
        parameters.setAboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear.name());
        game.setAboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear);
        parameters.setBelowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Noop.name());
        game.setBelowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Noop);

        parameters.setHidden(true);
        game.setHidden(parameters.isHidden());

        parameters.setCourseId(5L);
        game.setCourseId(parameters.getCourseId());

        requestBody = objectMapper.writeValueAsString(parameters);

        // When we save the game, it should be the values from after the update.
        when(gameRepository.save(game))
                .thenReturn(game);

        mockMvc
                .perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isNoContent());

        verify(gameRepository, times(1)).save(game);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void updateGameTest_withNoCowHealthUpdateStrategy() throws Exception {
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        LocalDateTime someLaterTime = LocalDateTime.parse("2022-07-05T15:50:10");

        CreateGameParams parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(50.0)
                .showLeaderboard(true)
                .showChat(false)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .hidden(false)
                .build();

        Game game = Game.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(50.0)
                .showLeaderboard(true)
                .showChat(false)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Constant)
                .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear)
                .hidden(false)
                .build();

        var objectMapperWithoutNulls = objectMapper.copy()
                .setSerializationInclusion(JsonInclude.Include.NON_NULL);
        String requestBody = objectMapperWithoutNulls.writeValueAsString(parameters);

        when(gameRepository.save(game))
                .thenReturn(game);
        when(gameRepository.findById(0L))
                .thenReturn(Optional.of(game));

        mockMvc
                .perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isNoContent());

        verify(gameRepository, times(1)).save(game);

        assertEquals(CowHealthUpdateStrategies.Constant, game.getAboveCapacityHealthUpdateStrategy());
        assertEquals(CowHealthUpdateStrategies.Linear, game.getBelowCapacityHealthUpdateStrategy());
    }


    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void updateGameTest_withDegradationRate_Zero() throws Exception {
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        LocalDateTime someLaterTime = LocalDateTime.parse("2022-07-05T15:50:10");

        CreateGameParams parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(8.49)
                .showLeaderboard(false)
                .showChat(false)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .hidden(false)
                .build();

        Game game = Game.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(8.49)
                .showLeaderboard(false)
                .showChat(false)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .hidden(false)
                .build();

        String requestBody = objectMapper.writeValueAsString(parameters);

        when(gameRepository.save(game))
                .thenReturn(game);

        mockMvc
                .perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isCreated());

        verify(gameRepository, times(1)).save(game);

        parameters.setMilkPrice(parameters.getMilkPrice() + 3.00);
        game.setMilkPrice(parameters.getMilkPrice());
        parameters.setDegradationRate(0);
        game.setDegradationRate(parameters.getDegradationRate());
        parameters.setCapacityPerUser(10);
        game.setCapacityPerUser(parameters.getCapacityPerUser());
        parameters.setCarryingCapacity(123);
        game.setCarryingCapacity(parameters.getCarryingCapacity());

        requestBody = objectMapper.writeValueAsString(parameters);

        when(gameRepository.findById(0L))
                .thenReturn(Optional.of(game));

        when(gameRepository.save(game))
                .thenReturn(game);

        mockMvc
                .perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isNoContent());

        verify(gameRepository, times(1)).save(game);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void updateGameTest_withIllegalDegradationRate() throws Exception {
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        LocalDateTime someLaterTime = LocalDateTime.parse("2022-07-05T15:50:10");

        CreateGameParams parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(8.49)
                .showLeaderboard(false)
                .showChat(false)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .hidden(false)
                .build();

        Game game = Game.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(8.49)
                .showLeaderboard(false)
                .showChat(false)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .hidden(false)
                .build();

        String requestBody = objectMapper.writeValueAsString(parameters);

        when(gameRepository.save(game))
                .thenReturn(game);

        mockMvc
                .perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isCreated());

        verify(gameRepository, times(1)).save(game);

        parameters.setDegradationRate(-10);
        game.setDegradationRate(parameters.getDegradationRate());

        requestBody = objectMapper.writeValueAsString(parameters);

        when(gameRepository.findById(0L))
                .thenReturn(Optional.of(game));

        when(gameRepository.save(game))
                .thenReturn(game);

        MvcResult response = mockMvc
                .perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest()).andReturn();

        assertInstanceOf(IllegalArgumentException.class, response.getResolvedException());
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void updateGameTest_hiddenCanBeToggled() throws Exception {
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        LocalDateTime someLaterTime = LocalDateTime.parse("2022-07-05T15:50:10");

        CreateGameParams parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(8.49)
                .showLeaderboard(false)
                .showChat(false)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .hidden(true)
                .build();

        Game game = Game.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(8.49)
                .showLeaderboard(false)
                .showChat(false)
                .capacityPerUser(10)
                .carryingCapacity(100)
                .hidden(true)
                .build();

        String requestBody = objectMapper.writeValueAsString(parameters);

        when(gameRepository.save(game))
                .thenReturn(game);

        mockMvc
                .perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isCreated());

        verify(gameRepository, times(1)).save(game);

        assertEquals(true, game.isHidden());
        parameters.setHidden(false);
        game.setHidden(parameters.isHidden());

        requestBody = objectMapper.writeValueAsString(parameters);

        when(gameRepository.findById(0L))
                .thenReturn(Optional.of(game));

        when(gameRepository.save(game))
                .thenReturn(game);

        mockMvc
                .perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isNoContent()).andReturn();

        assertEquals(false, game.isHidden());
        verify(gameRepository, times(1)).save(game);
    }

    // This common SHOULD be in the repository
    @WithMockUser(roles = {"USER"})
    @Test
    public void getGameByIdTest_valid() throws Exception {
        Game Game1 = Game.builder()
                .name("TestGame2")
                .id(18L)
                .build();

        when(gameRepository.findById(eq(18L))).thenReturn(Optional.of(Game1));

        MvcResult response = mockMvc.perform(get("/api/game?id=18"))
                .andExpect(status().isOk()).andReturn();

        verify(gameRepository, times(1)).findById(eq(18L));
        String expectedJson = mapper.writeValueAsString(Game1);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    // This game SHOULD be in the repository
    @WithMockUser(roles = {"USER"})
    @Test
    public void getGamePlusByIdTest_valid() throws Exception {
        Game game1 = Game.builder()
                .name("TestGame2")
                .id(18L)
                .build();
        GamePlus gamePlus = GamePlus.builder()
                .game(game1)
                .totalCows(5)
                .totalUsers(2)
                .build();
                
        when(gameRepository.findById(eq(18L))).thenReturn(Optional.of(game1));
        when(gameRepository.getNumCows(18L)).thenReturn(Optional.of(5));
        when(gameRepository.getNumUsers(18L)).thenReturn(Optional.of(2));
        when(gamePlusBuilderService.toGamePlus(eq(game1))).thenReturn(gamePlus);

        MvcResult response = mockMvc.perform(get("/api/game/plus?id=18"))
                .andExpect(status().isOk()).andReturn();

        verify(gameRepository, times(1)).findById(eq(18L));
        String expectedJson = mapper.writeValueAsString(gamePlus);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    // This common SHOULD NOT be in the repository
    @WithMockUser(roles = {"USER"})
    @Test
    public void getGameByIdTest_invalid() throws Exception {

        when(gameRepository.findById(eq(18L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc.perform(get("/api/game?id=18"))
                .andExpect(status().is(404)).andReturn();

        verify(gameRepository, times(1)).findById(eq(18L));

        Map<String, Object> responseMap = responseToJson(response);

        assertEquals(responseMap.get("message"), "Game with id 18 not found");
        assertEquals(responseMap.get("type"), "EntityNotFoundException");
    }

    // This game SHOULD NOT be in the repository
    @WithMockUser(roles = {"USER"})
    @Test
    public void getGamePlusByIdTest_invalid() throws Exception {                
        when(gameRepository.findById(eq(18L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc.perform(get("/api/game/plus?id=18"))
                .andExpect(status().is(404)).andReturn();

        verify(gameRepository, times(1)).findById(eq(18L));

        Map<String, Object> responseMap = responseToJson(response);

        assertEquals(responseMap.get("message"), "Game with id 18 not found");
        assertEquals(responseMap.get("type"), "EntityNotFoundException");
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void getHealthUpdateStrategiesTest() throws Exception {
        var response = mockMvc.perform(
                get("/api/game/all-health-update-strategies")
        ).andExpect(status().isOk()).andReturn();

        var expected = HealthUpdateStrategyList.create();
        var actual = mapper.readValue(response.getResponse().getContentAsString(), HealthUpdateStrategyList.class);
        assertEquals(expected, actual);

    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void joinGameTest() throws Exception {

        Game c = Game.builder()
                .id(2L)
                .name("Example Game")
                .build();

        Farmer uc = Farmer.builder()
                .user(currentUserService.getUser())
                .game(c)
                .username("Fake user")
                .totalWealth(0)
                .numOfCows(0)
                .cowHealth(100)
                .build();

        

        
        when(farmerRepository.findByGameIdAndUserId(anyLong(), anyLong())).thenReturn(Optional.empty());
        when(farmerRepository.save(eq(uc))).thenReturn(uc);
        when(gameRepository.findById(eq(2L))).thenReturn(Optional.of(c));

        MvcResult response = mockMvc
                .perform(post("/api/game/join?gameId=2").with(csrf()))
                .andExpect(status().isOk()).andReturn();

        verify(farmerRepository, times(1)).findByGameIdAndUserId(2L, 1L);
        verify(farmerRepository, times(1)).save(uc);

        
        String responseString = response.getResponse().getContentAsString();
        String cAsJson = mapper.writeValueAsString(c);

        assertEquals(responseString, cAsJson);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void already_joined_common_test() throws Exception {

        Game c = Game.builder()
                .id(2L)
                .name("Example Game")
                .build();

        Farmer uc = Farmer.builder()
                .user(currentUserService.getUser())
                .game(c)
                .username("1L")
                .totalWealth(0)
                .numOfCows(1)
                .build();

        String requestBody = mapper.writeValueAsString(uc);

        // Instead of returning empty, we instead say that it already exists. We
        // shouldn't create a new entry.
        when(farmerRepository.findByGameIdAndUserId(2L, 1L)).thenReturn(Optional.of(uc));
        when(farmerRepository.save(eq(uc))).thenReturn(uc);

        when(gameRepository.findById(eq(2L))).thenReturn(Optional.of(c));

        MvcResult response = mockMvc
                .perform(post("/api/game/join?gameId=2").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8").content(requestBody))
                .andExpect(status().isOk()).andReturn();

        verify(farmerRepository, times(1)).findByGameIdAndUserId(2L, 1L);

        String responseString = response.getResponse().getContentAsString();
        String cAsJson = mapper.writeValueAsString(c);

        assertEquals(responseString, cAsJson);
    }


    @WithMockUser(roles = {"USER"})
    @Test
    public void join_when_game_with_id_does_not_exist() throws Exception {

        when(gameRepository.findById(eq(2L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc
                .perform(post("/api/game/join?gameId=2").with(csrf()))
                .andExpect(status().is(404)).andReturn();

        verify(gameRepository, times(1)).findById(eq(2L));

        Map<String, Object> responseMap = responseToJson(response);

        assertEquals(responseMap.get("message"), "Game with id 2 not found");
        assertEquals(responseMap.get("type"), "EntityNotFoundException");
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void join_denied_when_user_not_eligible_for_course_linked_game() throws Exception {

        User currentUser = currentUserService.getUser();

        Game c = Game.builder()
                .id(2L)
                .name("Course Linked Game")
                .courseId(5L)
                .build();

        when(gameRepository.findById(eq(2L))).thenReturn(Optional.of(c));
        when(courseAccessService.isEligibleForGame(eq(currentUser), eq(c))).thenReturn(false);

        MvcResult response = mockMvc
                .perform(post("/api/game/join?gameId=2").with(csrf()))
                .andExpect(status().isBadRequest()).andReturn();

        verify(courseAccessService, times(1)).isEligibleForGame(currentUser, c);
        verify(farmerRepository, times(0)).save(any());

        Map<String, Object> responseMap = responseToJson(response);
        assertEquals("CourseAccessDeniedException", responseMap.get("type"));
        assertEquals(
                "You are not enrolled in the course required to join game with id 2",
                responseMap.get("message"));
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void join_allowed_when_user_eligible_for_course_linked_game() throws Exception {

        User currentUser = currentUserService.getUser();

        Game c = Game.builder()
                .id(2L)
                .name("Course Linked Game")
                .courseId(5L)
                .build();

        Farmer uc = Farmer.builder()
                .user(currentUser)
                .game(c)
                .username("Fake user")
                .totalWealth(0)
                .numOfCows(0)
                .cowHealth(100)
                .build();

        when(gameRepository.findById(eq(2L))).thenReturn(Optional.of(c));
        when(courseAccessService.isEligibleForGame(eq(currentUser), eq(c))).thenReturn(true);
        when(farmerRepository.findByGameIdAndUserId(anyLong(), anyLong())).thenReturn(Optional.empty());
        when(farmerRepository.save(eq(uc))).thenReturn(uc);

        MvcResult response = mockMvc
                .perform(post("/api/game/join?gameId=2").with(csrf()))
                .andExpect(status().isOk()).andReturn();

        verify(courseAccessService, times(1)).isEligibleForGame(currentUser, c);
        verify(farmerRepository, times(1)).save(uc);

        String responseString = response.getResponse().getContentAsString();
        String cAsJson = mapper.writeValueAsString(c);
        assertEquals(responseString, cAsJson);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void join_does_not_check_course_eligibility_when_game_has_no_course() throws Exception {

        Game c = Game.builder()
                .id(2L)
                .name("Example Game")
                .build();

        Farmer uc = Farmer.builder()
                .user(currentUserService.getUser())
                .game(c)
                .username("Fake user")
                .totalWealth(0)
                .numOfCows(0)
                .cowHealth(100)
                .build();

        when(gameRepository.findById(eq(2L))).thenReturn(Optional.of(c));
        when(farmerRepository.findByGameIdAndUserId(anyLong(), anyLong())).thenReturn(Optional.empty());
        when(farmerRepository.save(eq(uc))).thenReturn(uc);

        mockMvc.perform(post("/api/game/join?gameId=2").with(csrf()))
                .andExpect(status().isOk());

        verify(courseAccessService, times(0)).isEligibleForGame(any(), any());
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void getMyCourseIdsTest() throws Exception {

        User currentUser = currentUserService.getUser();

        List<Long> expectedCourseIds = List.of(5L, 6L);
        when(courseAccessService.getCourseIdsForUser(currentUser)).thenReturn(expectedCourseIds);

        MvcResult response = mockMvc.perform(get("/api/game/mycourses"))
                .andExpect(status().isOk()).andReturn();

        verify(courseAccessService, times(1)).getCourseIdsForUser(currentUser);
        String expectedJson = mapper.writeValueAsString(expectedCourseIds);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @Test
    public void logged_out_users_cannot_get_my_course_ids() throws Exception {
        mockMvc.perform(get("/api/game/mycourses"))
                .andExpect(status().is(403));
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void deleteGame_test_admin_exists() throws Exception {
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        LocalDateTime someLaterTime = LocalDateTime.parse("2022-07-05T15:50:10");

        Game c = Game.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(someTime)
                .lastDate(someLaterTime)
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .carryingCapacity(100)
                .build();

        Farmer uc1 = Farmer.builder()
                .user(currentUserService.getUser())
                .game(c)
                .username("1L")
                .totalWealth(0)
                .numOfCows(1)
                .build();

        Farmer uc2 = Farmer.builder()
                .user(currentUserService.getUser())
                .game(c)
                .username("3L")
                .totalWealth(0)
                .numOfCows(1)
                .build();

        List<Farmer> farmer = new ArrayList<>();
        farmer.add(uc1);
        farmer.add(uc2);

        when(gameRepository.findById(eq(2L))).thenReturn(Optional.of(c));
        when(farmerRepository.findByGameId(2L)).thenReturn(farmer);
        doNothing().when(gameRepository).deleteById(2L);

        MvcResult response = mockMvc.perform(
                        delete("/api/game?id=2")
                                .with(csrf()))
                .andExpect(status().is(200)).andReturn();

        verify(gameRepository, times(1)).findById(2L);
        verify(gameRepository, times(1)).deleteById(2L);

        verify(farmerRepository, times(1)).findByGameId(2L);
        verify(farmerRepository, times(1)).delete(uc1);
        verify(farmerRepository, times(1)).delete(uc2);

        String responseString = response.getResponse().getContentAsString();

        String expectedString = "{\"message\":\"game with id 2 deleted\"}";

        assertEquals(expectedString, responseString);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void deleteGame_test_admin_nonexists() throws Exception {

        when(gameRepository.findById(eq(2L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc.perform(
                        delete("/api/game?id=2")
                                .with(csrf()))
                .andExpect(status().is(404)).andReturn();
        verify(gameRepository, times(1)).findById(2L);


        String expectedString = "{\"message\":\"Game with id 2 not found\",\"type\":\"EntityNotFoundException\"}";

        Map<String, Object> expectedJson = mapper.readValue(expectedString, new TypeReference<Map<String, Object>>() {
        });
        Map<String, Object> jsonResponse = responseToJson(response);
        assertEquals(expectedJson, jsonResponse);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void deleteUserFromGameTest() throws Exception {
        Game c = Game.builder()
        .id(2L)
        .name("Example Game")
        .build();

        Farmer uc = Farmer.builder()
                .user(currentUserService.getUser())
                .game(Game.builder().id(1).build())
                .username("1L")
                .totalWealth(0)
                .numOfCows(1)
                .build();


        String requestBody = mapper.writeValueAsString(uc);

        when(farmerRepository.findByGameIdAndUserId(2L, 1L)).thenReturn(Optional.of(uc));
        when(gameRepository.findById(2L)).thenReturn(Optional.of(c));
        when(gameRepository.getNumUsers(2L)).thenReturn(Optional.of(0));

        MvcResult response = mockMvc
                .perform(delete("/api/game/2/users/1").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8").content(requestBody))
                .andExpect(status().is(200)).andReturn();

        verify(farmerRepository, times(1)).findByGameIdAndUserId(2L, 1L);
        verify(farmerRepository, times(1)).delete(uc);

        String responseString = response.getResponse().getContentAsString();
        String expectedString = "{\"message\":\"user with id 1 deleted from game with id 2, 0 users remain\"}";

        assertEquals(responseString, expectedString);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void deleteUserFromGame_when_not_joined() throws Exception {


        when(farmerRepository.findByGameIdAndUserId(2L, 1L)).thenReturn(Optional.empty());

        mockMvc
                .perform(delete("/api/game/2/users/1").with(csrf()))
                .andExpect(status().is(404)).andReturn();
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void getGamePlusTest() throws Exception {
        List<Game> expectedGame = new ArrayList<>();
        Game Game1 = Game.builder().name("TestGame1").id(1L).build();
        expectedGame.add(Game1);

        List<GamePlus> expectedGamePlus = new ArrayList<>();
        GamePlus GamePlus1 = GamePlus.builder()
                .game(Game1)
                .totalCows(50)
                .totalUsers(20)
                .build();

        expectedGamePlus.add(GamePlus1);
        when(gameRepository.findAll()).thenReturn(expectedGame);
        when(gameRepository.getNumCows(1L)).thenReturn(Optional.of(50));
        when(gameRepository.getNumUsers(1L)).thenReturn(Optional.of(20));
        when(gamePlusBuilderService.convertToGamePlus(eq(expectedGame))).thenReturn(expectedGamePlus);
        MvcResult response = mockMvc.perform(get("/api/game/allplus").contentType("application/json"))
                .andExpect(status().isOk()).andReturn();

        verify(gameRepository, times(1)).findAll();

        String responseString = response.getResponse().getContentAsString();
        List<GamePlus> actualGamePlus = objectMapper.readValue(responseString,
                new TypeReference<List<GamePlus>>() {
                });
        assertEquals(actualGamePlus, expectedGamePlus);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void getGamePlusTest_returnsGameSortedNewestFirst() throws Exception {
        Game game1 = Game.builder().name("TestGame1").id(1L).build();
        Game game3 = Game.builder().name("TestGame3").id(3L).build();
        Game game2 = Game.builder().name("TestGame2").id(2L).build();

        List<Game> unsortedGame = new ArrayList<>(List.of(game1, game3, game2));
        List<Game> sortedGame = new ArrayList<>(List.of(game3, game2, game1));

        List<GamePlus> expectedGamePlus = new ArrayList<>(List.of(
                GamePlus.builder().game(game3).totalCows(30).totalUsers(3).build(),
                GamePlus.builder().game(game2).totalCows(20).totalUsers(2).build(),
                GamePlus.builder().game(game1).totalCows(10).totalUsers(1).build()));

        when(gameRepository.findAll()).thenReturn(unsortedGame);
        when(gamePlusBuilderService.convertToGamePlus(eq(sortedGame))).thenReturn(expectedGamePlus);

        MvcResult response = mockMvc.perform(get("/api/game/allplus").contentType("application/json"))
                .andExpect(status().isOk()).andReturn();

        String responseString = response.getResponse().getContentAsString();
        List<GamePlus> actualGamePlus = objectMapper.readValue(responseString,
                new TypeReference<List<GamePlus>>() {
                });
        assertEquals(expectedGamePlus, actualGamePlus);
        List<Long> actualIds = actualGamePlus.stream().map((cp) -> cp.getGame().getId()).toList();
        assertEquals(List.of(3L, 2L, 1L), actualIds);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void createGameTest_withIllegalParameters() throws Exception {
        // name is empty
        CreateGameParams parameters = CreateGameParams.builder()
                .name("")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .carryingCapacity(100)
                .build();

        String requestBody = objectMapper.writeValueAsString(parameters);

        MvcResult response = mockMvc
                .perform(post("/api/game/new").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest()).andReturn();
        
        assertInstanceOf(IllegalArgumentException.class, response.getResolvedException());

        // Cow price is < 0.01
        parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(0.009)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .carryingCapacity(100)
                .build();
        
        requestBody = objectMapper.writeValueAsString(parameters);

        response = mockMvc
                .perform(post("/api/game/new").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest()).andReturn();

        assertInstanceOf(IllegalArgumentException.class, response.getResolvedException());

        // Milk price is < 0.01
        parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(0.009)
                .startingBalance(1020.10)
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .carryingCapacity(100)
                .build();

        requestBody = objectMapper.writeValueAsString(parameters);

        response = mockMvc
                .perform(post("/api/game/new").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest()).andReturn();
        
        assertInstanceOf(IllegalArgumentException.class, response.getResolvedException());

        // Starting balance is < 0
        parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(-1.0)
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .carryingCapacity(100)
                .build();
        
        requestBody = objectMapper.writeValueAsString(parameters);

        response = mockMvc
                .perform(post("/api/game/new").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest()).andReturn();
        
        assertInstanceOf(IllegalArgumentException.class, response.getResolvedException());

        // Carrying capacity is < 1
        parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .carryingCapacity(0)
                .build();

        requestBody = objectMapper.writeValueAsString(parameters);

        response = mockMvc
                .perform(post("/api/game/new").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest()).andReturn();

        assertInstanceOf(IllegalArgumentException.class, response.getResolvedException());
    }
    
    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void createGameTest_withBoundaryParameters() throws Exception {
        // We're using boundary values, so we expect these to work
        CreateGameParams parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(0.01)
                .milkPrice(0.01)
                .startingBalance(0.0)
                .startingDate(LocalDateTime.parse("2022-03-05T15:50:10"))
                .lastDate(LocalDateTime.parse("2022-07-05T15:50:10"))
                .degradationRate(0.0)
                .showLeaderboard(false)
                .showChat(false)
                .carryingCapacity(1)
                .build();

        String requestBody = objectMapper.writeValueAsString(parameters);

        MvcResult response = mockMvc
                .perform(post("/api/game/new").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isOk()).andReturn();

        verify(gameRepository, times(1)).save(any(Game.class));
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void UpdateGameTest_withIllegalParameters() throws Exception {
        // we first create a game to update
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        LocalDateTime someLaterTime = LocalDateTime.parse("2022-07-05T15:50:10");
        Game game = Game.builder()
        .name("Jackson's Game")
        .cowPrice(500.99)
        .milkPrice(8.99)
        .startingBalance(1020.10)
        .startingDate(someTime)
        .lastDate(someLaterTime)
        .degradationRate(50.0)
        .showLeaderboard(false)
        .showChat(false)
        .carryingCapacity(100)
        .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Constant)
        .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear)
        .build();

        when(gameRepository.findById(0L))
                .thenReturn(Optional.of(game));

        // name is empty
        CreateGameParams parameters = CreateGameParams.builder()
                .name("")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .carryingCapacity(100)
                .build();

        String requestBody = objectMapper.writeValueAsString(parameters);

        MvcResult response = mockMvc
                .perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest()).andReturn();
        
        assertInstanceOf(IllegalArgumentException.class, response.getResolvedException());

        // Cow price is < 0.01
        parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(0.009)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .carryingCapacity(100)
                .build();

        requestBody = objectMapper.writeValueAsString(parameters);

        response = mockMvc
                .perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest()).andReturn();

        assertInstanceOf(IllegalArgumentException.class, response.getResolvedException());

        // Milk price is < 0.01
        parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(0.009)
                .startingBalance(1020.10)
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .carryingCapacity(100)
                .build();

        requestBody = objectMapper.writeValueAsString(parameters);

        response = mockMvc
                .perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest()).andReturn();

        assertInstanceOf(IllegalArgumentException.class, response.getResolvedException());

        // Starting balance is < 0
        parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(-1.0)
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .carryingCapacity(100)
                .build();

        requestBody = objectMapper.writeValueAsString(parameters);

        response = mockMvc
                .perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest()).andReturn();

        assertInstanceOf(IllegalArgumentException.class, response.getResolvedException());

        // Carrying capacity is < 1
        parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .carryingCapacity(0)
                .build();

        requestBody = objectMapper.writeValueAsString(parameters);

        response = mockMvc
                .perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest()).andReturn();

        assertInstanceOf(IllegalArgumentException.class, response.getResolvedException());
    }


    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void UpdateGameTest_withBoundaryParameters() throws Exception {
        // we first create a game to update
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        LocalDateTime someLaterTime = LocalDateTime.parse("2022-07-05T15:50:10");
        Game game = Game.builder()
        .name("Jackson's Game")
        .cowPrice(500.99)
        .milkPrice(8.99)
        .startingBalance(1020.10)
        .startingDate(someTime)
        .lastDate(someLaterTime)
        .degradationRate(50.0)
        .showLeaderboard(false)
        .showChat(false)
        .carryingCapacity(100)
        .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Constant)
        .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear)
        .build();

        when(gameRepository.findById(0L))
                .thenReturn(Optional.of(game));

        // We're using boundary values, so we expect these to work
        CreateGameParams parameters = CreateGameParams.builder()
                .name("Jackson's Game")
                .cowPrice(0.01)
                .milkPrice(0.01)
                .startingBalance(0.0)
                .startingDate(LocalDateTime.parse("2022-03-05T15:50:10"))
                .lastDate(LocalDateTime.parse("2022-07-05T15:50:10"))
                .degradationRate(0.0)
                .showLeaderboard(false)
                .showChat(false)
                .carryingCapacity(1)
                .build();

        String requestBody = objectMapper.writeValueAsString(parameters);

        MvcResult response = mockMvc
                .perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isNoContent()).andReturn();

        verify(gameRepository, times(1)).save(any(Game.class));
        
    }


    @WithMockUser(roles = {"USER"})
    @Test void test_capacity_with_lower_per_user() throws Exception{
        
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        LocalDateTime someLaterTime = LocalDateTime.parse("2022-07-05T15:50:10");
        Game game = Game.builder()
        .name("Jackson's Game")
        .cowPrice(500.99)
        .milkPrice(8.99)
        .startingBalance(1020.10)
        .startingDate(someTime)
        .lastDate(someLaterTime)
        .degradationRate(50.0)
        .showLeaderboard(false)
        .showChat(false)
        .capacityPerUser(5)
        .carryingCapacity(10)
        .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Constant)
        .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear)
        .build();

        GamePlus gamePlus = GamePlus.builder().game(game).totalUsers(1).totalCows(5).build();

        assertEquals(10, gamePlus.getEffectiveCapacity());
    }

    @WithMockUser(roles = {"USER"})
    @Test void test_capacity_with_higher_per_user() throws Exception{
        
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        LocalDateTime someLaterTime = LocalDateTime.parse("2022-07-05T15:50:10");
        Game game = Game.builder()
        .name("Jackson's Game")
        .cowPrice(500.99)
        .milkPrice(8.99)
        .startingBalance(1020.10)
        .startingDate(someTime)
        .lastDate(someLaterTime)
        .degradationRate(50.0)
        .showLeaderboard(false)
        .showChat(false)
        .capacityPerUser(50)
        .carryingCapacity(10)
        .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Constant)
        .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear)
        .build();

        GamePlus gamePlus = GamePlus.builder().game(game).totalUsers(2).totalCows(5).build();

        assertEquals(100, gamePlus.getEffectiveCapacity());
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void getNumCowsForGameId_user_multiple_farmers() throws Exception {
        Game c = Game.builder().id(1L).name("Test Game").build();

        Farmer uc1 = Farmer.builder()
                .game(c)
                .numOfCows(3)
                .build();

        Farmer uc2 = Farmer.builder()
                .game(c)
                .numOfCows(7)
                .build();

        List<Farmer> farmerList = new ArrayList<>();
        farmerList.add(uc1);
        farmerList.add(uc2);

        when(farmerRepository.findByGameId(eq(1L))).thenReturn(farmerList);

        MvcResult response = mockMvc.perform(get("/api/game/numcows?gameId=1"))
                .andExpect(status().isOk()).andReturn();

        verify(farmerRepository, times(1)).findByGameId(eq(1L));

        String responseString = response.getResponse().getContentAsString();
        List<Integer> actual = objectMapper.readValue(responseString, new TypeReference<List<Integer>>() {});
        List<Integer> expected = List.of(3, 7);
        assertEquals(expected, actual);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void getNumCowsForGameId_user_no_farmers() throws Exception {
        when(farmerRepository.findByGameId(eq(2L))).thenReturn(new ArrayList<>());

        MvcResult response = mockMvc.perform(get("/api/game/numcows?gameId=2"))
                .andExpect(status().isOk()).andReturn();

        verify(farmerRepository, times(1)).findByGameId(eq(2L));

        String responseString = response.getResponse().getContentAsString();
        List<Integer> actual = objectMapper.readValue(responseString, new TypeReference<List<Integer>>() {});
        assertEquals(new ArrayList<>(), actual);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void updateDashboardSettings_admin_ok() throws Exception {
        Game existing = Game.builder()
                .id(5L)
                .name("Test Game")
                .showLeaderboard(false)
                .showOverviewSection(true)
                .showCowsPerFarmerSection(false)
                .showCapacitySection(true)
                .showHistogramSection(true)
                .showTrendsSection(false)
                .showHealthSection(true)
                .showTotalCowsSection(false)
                .showFarmerLeaderboardSection(true)
                .build();

        Game updated = Game.builder()
                .id(5L)
                .name("Test Game")
                .showLeaderboard(true)
                .showOverviewSection(false)
                .showCowsPerFarmerSection(true)
                .showCapacitySection(false)
                .showHistogramSection(false)
                .showTrendsSection(true)
                .showHealthSection(false)
                .showTotalCowsSection(true)
                .showFarmerLeaderboardSection(false)
                .build();

        DashboardSettingsParams params = DashboardSettingsParams.builder()
                .showLeaderboard(true)
                .showOverviewSection(false)
                .showCowsPerFarmerSection(true)
                .showCapacitySection(false)
                .showHistogramSection(false)
                .showTrendsSection(true)
                .showHealthSection(false)
                .showTotalCowsSection(true)
                .showFarmerLeaderboardSection(false)
                .build();

        when(gameRepository.findById(eq(5L))).thenReturn(Optional.of(existing));
        when(gameRepository.save(eq(updated))).thenReturn(updated);

        String requestBody = objectMapper.writeValueAsString(params);

        MvcResult response = mockMvc
                .perform(put("/api/game/dashboardSettings?id=5").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isOk()).andReturn();

        verify(gameRepository, times(1)).findById(eq(5L));
        verify(gameRepository, times(1)).save(eq(updated));

        String responseString = response.getResponse().getContentAsString();
        Game actual = objectMapper.readValue(responseString, Game.class);
        assertEquals(updated, actual);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void updateDashboardSettings_not_found() throws Exception {
        DashboardSettingsParams params = DashboardSettingsParams.builder()
                .showLeaderboard(true)
                .showOverviewSection(true)
                .showCowsPerFarmerSection(true)
                .showCapacitySection(true)
                .showHistogramSection(true)
                .showTrendsSection(true)
                .showHealthSection(true)
                .showTotalCowsSection(true)
                .showFarmerLeaderboardSection(true)
                .build();

        when(gameRepository.findById(eq(99L))).thenReturn(Optional.empty());

        String requestBody = objectMapper.writeValueAsString(params);

        mockMvc
                .perform(put("/api/game/dashboardSettings?id=99").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isNotFound());

        verify(gameRepository, times(1)).findById(eq(99L));
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void updateDashboardSettings_non_admin_forbidden() throws Exception {
        DashboardSettingsParams params = DashboardSettingsParams.builder().build();
        String requestBody = objectMapper.writeValueAsString(params);

        mockMvc
                .perform(put("/api/game/dashboardSettings?id=5").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().is(403));
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void getNumCowsForGameId_user_ok() throws Exception {
        when(farmerRepository.findByGameId(eq(1L))).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/api/game/numcows?gameId=1"))
                .andExpect(status().isOk()).andReturn();
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void getGameTimeSeries_user_ok_multiple_stats() throws Exception {
        GameStats earlier = GameStats.builder()
                .gameId(9L)
                .numCows(10)
                .avgHealth(80.5)
                .createDate(Instant.parse("2024-01-01T00:00:00Z"))
                .build();

        GameStats later = GameStats.builder()
                .gameId(9L)
                .numCows(12)
                .avgHealth(75.0)
                .createDate(Instant.parse("2024-01-02T00:00:00Z"))
                .build();

        when(gameStatsRepository.findAllByGameId(eq(9L))).thenReturn(List.of(later, earlier));

        MvcResult response = mockMvc.perform(get("/api/game/timeseries?commonId=9"))
                .andExpect(status().isOk()).andReturn();

        verify(gameStatsRepository, times(1)).findAllByGameId(eq(9L));

        String responseString = response.getResponse().getContentAsString();
        List<Map<String, Object>> actual = objectMapper.readValue(responseString, new TypeReference<List<Map<String, Object>>>() {});

        List<Map<String, Object>> expected = List.of(
                Map.of(
                        "name", "Health",
                        "color", "#0088FE",
                        "percentage", true,
                        "values", List.of(
                                Map.of("date", "2024-01-01T00:00:00Z", "value", 80.5),
                                Map.of("date", "2024-01-02T00:00:00Z", "value", 75.0))),
                Map.of(
                        "name", "Total Cows",
                        "color", "#FF8042",
                        "values", List.of(
                                Map.of("date", "2024-01-01T00:00:00Z", "value", 10),
                                Map.of("date", "2024-01-02T00:00:00Z", "value", 12))));

        assertEquals(expected, actual);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void getGameTimeSeries_user_ok() throws Exception {
        when(gameStatsRepository.findAllByGameId(eq(9L))).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/api/game/timeseries?commonId=9"))
                .andExpect(status().isOk()).andReturn();
    }

    private CreateGameParams.CreateGameParamsBuilder validParamsBuilder() {
        return CreateGameParams.builder()
                .name("Test Game")
                .cowPrice(500.99)
                .milkPrice(8.99)
                .startingBalance(1020.10)
                .startingDate(LocalDateTime.parse("2022-03-05T15:50:10"))
                .lastDate(LocalDateTime.parse("2022-07-05T15:50:10"))
                .degradationRate(50.0)
                .showLeaderboard(false)
                .showChat(false)
                .capacityPerUser(10)
                .carryingCapacity(100);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void createGameTest_startingDateMissing_badRequest() throws Exception {
        CreateGameParams parameters = validParamsBuilder().startingDate(null).build();
        String requestBody = objectMapper.writeValueAsString(parameters);

        mockMvc.perform(post("/api/game/new").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest());

        verify(gameRepository, times(0)).save(any());
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void createGameTest_lastDateMissing_badRequest() throws Exception {
        CreateGameParams parameters = validParamsBuilder().lastDate(null).build();
        String requestBody = objectMapper.writeValueAsString(parameters);

        mockMvc.perform(post("/api/game/new").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest());

        verify(gameRepository, times(0)).save(any());
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void createGameTest_lastDateEqualsStartingDate_badRequest() throws Exception {
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        CreateGameParams parameters = validParamsBuilder()
                .startingDate(someTime).lastDate(someTime).build();
        String requestBody = objectMapper.writeValueAsString(parameters);

        mockMvc.perform(post("/api/game/new").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest());

        verify(gameRepository, times(0)).save(any());
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void createGameTest_lastDateBeforeStartingDate_badRequest() throws Exception {
        CreateGameParams parameters = validParamsBuilder()
                .startingDate(LocalDateTime.parse("2022-07-05T15:50:10"))
                .lastDate(LocalDateTime.parse("2022-03-05T15:50:10"))
                .build();
        String requestBody = objectMapper.writeValueAsString(parameters);

        mockMvc.perform(post("/api/game/new").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest());

        verify(gameRepository, times(0)).save(any());
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void updateGameTest_startingDateMissing_badRequest() throws Exception {
        CreateGameParams parameters = validParamsBuilder().startingDate(null).build();
        String requestBody = objectMapper.writeValueAsString(parameters);

        when(gameRepository.findById(eq(0L))).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest());

        verify(gameRepository, times(0)).save(any());
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void updateGameTest_lastDateMissing_badRequest() throws Exception {
        CreateGameParams parameters = validParamsBuilder().lastDate(null).build();
        String requestBody = objectMapper.writeValueAsString(parameters);

        when(gameRepository.findById(eq(0L))).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest());

        verify(gameRepository, times(0)).save(any());
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void updateGameTest_lastDateNotAfterStartingDate_badRequest() throws Exception {
        LocalDateTime someTime = LocalDateTime.parse("2022-03-05T15:50:10");
        CreateGameParams parameters = validParamsBuilder()
                .startingDate(someTime).lastDate(someTime).build();
        String requestBody = objectMapper.writeValueAsString(parameters);

        when(gameRepository.findById(eq(0L))).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/game/update?id=0").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isBadRequest());

        verify(gameRepository, times(0)).save(any());
    }
}
