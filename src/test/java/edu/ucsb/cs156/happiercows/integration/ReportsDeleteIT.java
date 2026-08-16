package edu.ucsb.cs156.happiercows.integration;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import edu.ucsb.cs156.happiercows.entities.Report;
import edu.ucsb.cs156.happiercows.entities.ReportLine;
import edu.ucsb.cs156.happiercows.repositories.ReportLineRepository;
import edu.ucsb.cs156.happiercows.repositories.ReportRepository;
import edu.ucsb.cs156.happiercows.testconfig.TestConfig;

// Regression test for the Delete/Purge Report endpoints (see issue #315):
// @WebMvcTest-based ReportsControllerTests mocks the repositories, so it
// cannot catch a bug where a repository call fails against a real
// EntityManager/transaction. Spring Data's derived deleteAllByReportId query
// requires an active transaction to run (unlike save()/delete(), it does not
// open one on its own), and with open-in-view disabled, calling it from a
// non-@Transactional controller method throws TransactionRequiredException.
// This exercises the endpoints against a real H2 database with a real
// transaction manager, the same way the deployed app does.
@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class ReportsDeleteIT {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ReportRepository reportRepository;

    @Autowired
    ReportLineRepository reportLineRepository;

    private Report saveReport(String name, long gameId) {
        return reportRepository.save(Report.builder()
                .name(name)
                .gameId(gameId)
                .cowPrice(1)
                .milkPrice(1)
                .startingBalance(1)
                .showLeaderboard(true)
                .carryingCapacity(1)
                .degradationRate(0.01)
                .numCows(1)
                .numUsers(1)
                .build());
    }

    private void saveReportLine(long reportId) {
        reportLineRepository.save(ReportLine.builder()
                .reportId(reportId)
                .userId(1L)
                .username("test")
                .totalWealth(1)
                .numOfCows(1)
                .avgCowHealth(1)
                .cowsBought(0)
                .cowsSold(0)
                .cowDeaths(0)
                .build());
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_delete_a_report_and_its_lines_are_removed() throws Exception {
        Report report = saveReport("test", 1L);
        saveReportLine(report.getId());

        mockMvc.perform(delete("/api/reports?reportId=" + report.getId()).with(csrf()))
                .andExpect(status().isOk());

        assertTrue(reportRepository.findById(report.getId()).isEmpty());
        assertFalse(reportLineRepository.findAllByReportId(report.getId()).iterator().hasNext());
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_purge_older_reports_and_they_and_their_lines_are_removed() throws Exception {
        Report older = saveReport("older", 1L);
        saveReportLine(older.getId());

        Report newer = saveReport("newer", 1L);
        saveReportLine(newer.getId());

        mockMvc.perform(delete("/api/reports/purge?reportId=" + newer.getId()).with(csrf()))
                .andExpect(status().isOk());

        assertTrue(reportRepository.findById(older.getId()).isEmpty());
        assertFalse(reportLineRepository.findAllByReportId(older.getId()).iterator().hasNext());

        assertTrue(reportRepository.findById(newer.getId()).isPresent());
        assertTrue(reportLineRepository.findAllByReportId(newer.getId()).iterator().hasNext());
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void deleting_a_nonexistent_report_returns_404() throws Exception {
        mockMvc.perform(delete("/api/reports?reportId=999999").with(csrf()))
                .andExpect(status().isNotFound());
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void purging_from_a_nonexistent_report_returns_404() throws Exception {
        mockMvc.perform(delete("/api/reports/purge?reportId=999999").with(csrf()))
                .andExpect(status().isNotFound());
    }
}
