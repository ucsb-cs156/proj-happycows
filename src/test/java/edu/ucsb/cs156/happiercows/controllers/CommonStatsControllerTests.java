package edu.ucsb.cs156.happiercows.controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.CommonStats;
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.Report;
import edu.ucsb.cs156.happiercows.entities.ReportLine;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.repositories.CommonStatsRepository;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.ReportLineRepository;
import edu.ucsb.cs156.happiercows.repositories.ReportRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.services.AverageCowHealthService;
import edu.ucsb.cs156.happiercows.services.CommonStatsService;
import edu.ucsb.cs156.happiercows.strategies.CowHealthUpdateStrategies;

import edu.ucsb.cs156.happiercows.testconfig.TestConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CommonStatsController.class)
public class CommonStatsControllerTests extends ControllerTestCase {

    @Autowired
    private ObjectMapper objectMapper;
        
    @MockBean
    UserRepository userRepository;
  
    @MockBean
    GameRepository gameRepository;
  
    @MockBean
    FarmerRepository farmerRepository;   

    @MockBean
    CommonStatsRepository commonStatsRepository;    

    @MockBean
    AverageCowHealthService averageCowHealthService;


    private Game game = Game
        .builder()
        .id(17L)
        .name("test game")
        .cowPrice(10)
        .milkPrice(2)
        .startingBalance(300)
        .startingDate(LocalDateTime.parse("2022-03-05T15:50:10"))
        .showLeaderboard(true)
        .carryingCapacity(100)
        .degradationRate(0.01)
        .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear)
        .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear)
        .build();

    CommonStats expectedStats1 = CommonStats
        .builder()
        .gameId(17L)
        .numCows(20)
        .avgHealth(10)
        .createDate(Instant.parse("2004-03-11T08:00:00Z"))
        .build();

    CommonStats expectedStats2 = CommonStats
        .builder()
        .gameId(42L)
        .numCows(120)
        .avgHealth(20)
        .createDate(Instant.parse("2004-03-27T08:00:00Z"))
        .build();

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void get_all_common_stats() throws Exception {
        Iterable<CommonStats> expectedStats = List.of(expectedStats1, expectedStats2);
        when(commonStatsRepository.findAll()).thenReturn(expectedStats);

        MvcResult response = mockMvc.perform(get("/api/commonstats")).andDo(print())
        .andExpect(status().isOk()).andReturn();

        verify(commonStatsRepository, times(1)).findAll();

        String responseString = response.getResponse().getContentAsString();
                List<CommonStats> actualStats = objectMapper.readValue(responseString, new TypeReference<List<CommonStats>>() {
                });
                assertEquals(expectedStats, actualStats);

    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void get_stats_by_gameId() throws Exception {
        Iterable<CommonStats> expectedStats = List.of(expectedStats1);
        when(commonStatsRepository.findAllByGameId(17L)).thenReturn(expectedStats);

        MvcResult response = mockMvc.perform(get("/api/commonstats/game?gameId=17")).andDo(print())
        .andExpect(status().isOk()).andReturn();

        verify(commonStatsRepository, times(1)).findAllByGameId(17L);

        String responseString = response.getResponse().getContentAsString();
                List<CommonStats> actualStats = objectMapper.readValue(responseString, new TypeReference<List<CommonStats>>() {
                });
                assertEquals(expectedStats, actualStats);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void test_get_csv() throws Exception {
            when(commonStatsRepository.findAllByGameId(17L)).thenReturn(List.of(expectedStats1));
            
            MvcResult response = mockMvc.perform(get("/api/commonstats/download?gameId=17")).andDo(print())
                            .andExpect(status().isOk()).andReturn();

            verify(commonStatsRepository, times(1)).findAllByGameId(eq(17L));
            String responseString = response.getResponse().getContentAsString();

            assertEquals("application/csv", response.getResponse().getContentType());

            String expected = 
                    "id,gameId,numCows,avgHealth,createDate\r\n" +
                    "0,17,20,10.0,2004-03-11 00:00:00\r\n";
                                        
            assertEquals(expected, responseString);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void test_get_all_csv() throws Exception {
            when(commonStatsRepository.findAll()).thenReturn(List.of(expectedStats1, expectedStats2));
            
            MvcResult response = mockMvc.perform(get("/api/commonstats/downloadAll")).andDo(print())
                            .andExpect(status().isOk()).andReturn();

            verify(commonStatsRepository, times(1)).findAll();
            String responseString = response.getResponse().getContentAsString();

            assertEquals("application/csv", response.getResponse().getContentType());

            String expected = 
                    "id,gameId,numCows,avgHealth,createDate\r\n" +
                    "0,17,20,10.0,2004-03-11 00:00:00\r\n" +
                    "0,42,120,20.0,2004-03-27 00:00:00\r\n";
                                        
            assertEquals(expected, responseString);
    }

}
