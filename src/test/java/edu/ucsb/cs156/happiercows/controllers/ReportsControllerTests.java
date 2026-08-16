package edu.ucsb.cs156.happiercows.controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.Report;
import edu.ucsb.cs156.happiercows.entities.ReportLine;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.ReportLineRepository;
import edu.ucsb.cs156.happiercows.repositories.ReportRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@WebMvcTest(controllers = ReportsController.class)
public class ReportsControllerTests extends ControllerTestCase {
        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        ReportRepository reportRepository;

        @MockBean
        ReportLineRepository reportLineRepository;

        @MockBean
        FarmerRepository farmerRepository;

        @MockBean
        UserRepository userRepository;

        @MockBean
        GameRepository gameRepository;

        private User user = User
                        .builder()
                        .id(42L)
                        .fullName("Chris Gaucho")
                        .email("cgaucho@example.org")
                        .build();

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

        Farmer farmer = Farmer
                        .builder()
                        .user(user)
                        .username("Chris Gaucho")
                        .game(game)
                        .totalWealth(300)
                        .numOfCows(123)
                        .cowHealth(10)
                        .cowsBought(78)
                        .cowsSold(23)
                        .cowDeaths(6)
                        .build();

        Report expectedReportHeader = Report.builder()
                        .id(432L)
                        .name("test game")
                        .gameId(17L)
                        .cowPrice(10)
                        .milkPrice(2)
                        .startingBalance(300)
                        .startingDate(LocalDateTime.parse("2022-03-05T15:50:10"))
                        .showLeaderboard(true)
                        .carryingCapacity(100)
                        .degradationRate(0.01)
                        .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear)
                        .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.Linear)
                        .numCows(123)
                        .numUsers(1)
                        .build();

        ReportLine expectedReportLine = ReportLine.builder()
                        .userId(42L)
                        .reportId(432L)
                        .username("Chris Gaucho")
                        .totalWealth(300)
                        .numOfCows(123)
                        .avgCowHealth(10)
                        .cowsBought(78)
                        .cowsSold(23)
                        .cowDeaths(6)
                        .build();


        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void get_all_report_headers() throws Exception {
                List<Report> reports = List.of(expectedReportHeader);
                when(reportRepository.findAll(any())).thenReturn(reports);
               
                MvcResult response = mockMvc.perform(get("/api/reports")).andDo(print())
                                .andExpect(status().isOk()).andReturn();

                verify(reportRepository, times(1)).findAll(any());

                String responseString = response.getResponse().getContentAsString();
                List<Report> actualReports = objectMapper.readValue(responseString, new TypeReference<List<Report>>() {
                });
                assertEquals(reports, actualReports);
        }

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void get_specific_report_header() throws Exception {
                Optional<Report> optionalReport = Optional.of(expectedReportHeader);
                when(reportRepository.findById(eq(432L))).thenReturn(optionalReport);
               
                MvcResult response = mockMvc.perform(get("/api/reports/byReportId?reportId=432")).andDo(print())
                                .andExpect(status().isOk()).andReturn();

                verify(reportRepository, times(1)).findById(eq(432L));

                String responseString = response.getResponse().getContentAsString();
                Optional<Report> actualReports = objectMapper.readValue(responseString, new TypeReference<Optional<Report>>() {
                });
                assertEquals(optionalReport, actualReports);
        }
                        
        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void get_reports_headers_commonId() throws Exception {
                List<Report> reports = List.of(expectedReportHeader);
                when(reportRepository.findAllByGameId(17L)).thenReturn(reports);
               
                MvcResult response = mockMvc.perform(get("/api/reports/headers?gameId=17")).andDo(print())
                                .andExpect(status().isOk()).andReturn();

                verify(reportRepository, times(1)).findAllByGameId(eq(17L));

                String responseString = response.getResponse().getContentAsString();
                List<Report> actualReports = objectMapper.readValue(responseString, new TypeReference<List<Report>>() {
                });
                assertEquals(reports, actualReports);
        }

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void get_reports_lines_commonId() throws Exception {
                List<ReportLine> lines = List.of(expectedReportLine);
                when(reportLineRepository.findAllByReportId(432L)).thenReturn(List.of(expectedReportLine));
               
                MvcResult response = mockMvc.perform(get("/api/reports/lines?reportId=432")).andDo(print())
                                .andExpect(status().isOk()).andReturn();

                verify(reportLineRepository, times(1)).findAllByReportId(eq(432L));

                String responseString = response.getResponse().getContentAsString();
                List<ReportLine> actualLines = objectMapper.readValue(responseString, new TypeReference<List<ReportLine>>() {
                });
                assertEquals(lines, actualLines);
        }

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void test_get_csv() throws Exception {
                when(reportLineRepository.findAllByReportId(432L)).thenReturn(List.of(expectedReportLine));
               
                MvcResult response = mockMvc.perform(get("/api/reports/download?reportId=432")).andDo(print())
                                .andExpect(status().isOk()).andReturn();

                verify(reportLineRepository, times(1)).findAllByReportId(eq(432L));
                String responseString = response.getResponse().getContentAsString();

                assertEquals("application/csv", response.getResponse().getContentType());

                String expected = 
                        "id,reportId,userId,username,totalWealth,numOfCows,avgCowHealth,cowsBought,cowsSold,cowDeaths,reportDate\r\n" +
                        "0,432,42,Chris Gaucho,300.0,123,10.0,78,23,6,null\r\n";
                                         
                assertEquals(expected, responseString);
        }

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void admin_can_delete_a_report() throws Exception {
                when(reportRepository.findById(eq(432L))).thenReturn(Optional.of(expectedReportHeader));

                MvcResult response = mockMvc
                                .perform(delete("/api/reports?reportId=432").with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                verify(reportRepository, times(1)).findById(eq(432L));
                verify(reportLineRepository, times(1)).deleteAllByReportId(eq(432L));
                verify(reportRepository, times(1)).delete(eq(expectedReportHeader));

                Map<String, Object> json = responseToJson(response);
                assertEquals("Report with id 432 deleted", json.get("message"));
        }

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void admin_tries_to_delete_non_existant_report_and_gets_right_error_message() throws Exception {
                when(reportRepository.findById(eq(432L))).thenReturn(Optional.empty());

                MvcResult response = mockMvc
                                .perform(delete("/api/reports?reportId=432").with(csrf()))
                                .andExpect(status().isNotFound()).andReturn();

                verify(reportRepository, times(1)).findById(eq(432L));
                Map<String, Object> json = responseToJson(response);
                assertEquals("Report with id 432 not found", json.get("message"));
        }

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void admin_can_purge_older_reports() throws Exception {
                Report olderReport1 = Report.builder().id(430L).gameId(17L).build();
                Report olderReport2 = Report.builder().id(431L).gameId(17L).build();

                when(reportRepository.findById(eq(432L))).thenReturn(Optional.of(expectedReportHeader));
                when(reportRepository.findAllByGameIdAndIdLessThan(eq(17L), eq(432L)))
                                .thenReturn(List.of(olderReport1, olderReport2));

                MvcResult response = mockMvc
                                .perform(delete("/api/reports/purge?reportId=432").with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                verify(reportRepository, times(1)).findById(eq(432L));
                verify(reportRepository, times(1)).findAllByGameIdAndIdLessThan(eq(17L), eq(432L));
                verify(reportLineRepository, times(1)).deleteAllByReportId(eq(430L));
                verify(reportLineRepository, times(1)).deleteAllByReportId(eq(431L));
                verify(reportRepository, times(1)).delete(eq(olderReport1));
                verify(reportRepository, times(1)).delete(eq(olderReport2));

                Map<String, Object> json = responseToJson(response);
                assertEquals("Purged 2 report(s) older than report with id 432", json.get("message"));
        }

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void admin_tries_to_purge_non_existant_report_and_gets_right_error_message() throws Exception {
                when(reportRepository.findById(eq(432L))).thenReturn(Optional.empty());

                MvcResult response = mockMvc
                                .perform(delete("/api/reports/purge?reportId=432").with(csrf()))
                                .andExpect(status().isNotFound()).andReturn();

                verify(reportRepository, times(1)).findById(eq(432L));
                Map<String, Object> json = responseToJson(response);
                assertEquals("Report with id 432 not found", json.get("message"));
        }

}
