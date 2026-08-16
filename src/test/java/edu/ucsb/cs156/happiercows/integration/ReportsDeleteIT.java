package edu.ucsb.cs156.happiercows.integration;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

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
//
// It also covers a second bug in the same PR: "purge reports older than this
// one" was implemented as "purge reports with a lower id, for the same game"
// - neither of which is what "older" means. "Older" means an earlier
// createDate, full stop, with no regard to which game a report belongs to.
// admin_can_purge_older_reports_globally_by_createDate below deliberately
// makes id order and createDate order disagree, and puts the reports in
// different games, so it fails under either wrong interpretation and only
// passes under the correct one.
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

    // @CreationTimestamp only fires on insert, not update, so saving an
    // already-persisted entity again with an explicit createDate lets tests
    // control it deterministically instead of racing the clock.
    private Report backDate(Report report, long secondsAgo) {
        report.setCreateDate(Date.from(Instant.now().minus(secondsAgo, ChronoUnit.SECONDS)));
        return reportRepository.save(report);
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
        Report older = backDate(saveReport("older", 1L), 60);
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

    // "Older" means an earlier createDate, full stop - not a lower id, and
    // not scoped to the anchor report's game. This test deliberately makes
    // id order and createDate order disagree, and puts the reports in
    // different games, so it would fail under either wrong interpretation:
    //  - byWrongDateButOlderId: bigger id than anchor (created after it),
    //    same game, but explicitly back-dated to an earlier createDate than
    //    the anchor. A lower-id-only rule would wrongly spare it.
    //  - byWrongIdButNewerDate: lower id than anchor (created before it),
    //    different game, but its createDate is left later than the anchor's
    //    (anchor is itself back-dated below the default "now"). A
    //    lower-id-only rule would wrongly purge it, and a same-game-only
    //    rule would ignore it entirely regardless of date.
    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_purge_older_reports_globally_by_createDate() throws Exception {
        Report spareBecauseNewerDate = saveReport("created first, but newer", 2L);
        saveReportLine(spareBecauseNewerDate.getId());

        Report anchor = backDate(saveReport("anchor", 1L), 30);

        Report purgedBecauseOlderDate =
                backDate(saveReport("created after anchor, but older", 1L), 60);
        saveReportLine(purgedBecauseOlderDate.getId());

        mockMvc.perform(delete("/api/reports/purge?reportId=" + anchor.getId()).with(csrf()))
                .andExpect(status().isOk());

        assertTrue(reportRepository.findById(purgedBecauseOlderDate.getId()).isEmpty());
        assertFalse(
                reportLineRepository.findAllByReportId(purgedBecauseOlderDate.getId()).iterator().hasNext());

        assertTrue(reportRepository.findById(spareBecauseNewerDate.getId()).isPresent());
        assertTrue(
                reportLineRepository.findAllByReportId(spareBecauseNewerDate.getId()).iterator().hasNext());

        assertTrue(reportRepository.findById(anchor.getId()).isPresent());
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
