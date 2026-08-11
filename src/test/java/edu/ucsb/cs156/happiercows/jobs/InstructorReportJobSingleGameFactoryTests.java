package edu.ucsb.cs156.happiercows.jobs;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import edu.ucsb.cs156.happiercows.JobTestCase;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.services.ReportService;
import edu.ucsb.cs156.happiercows.services.wiremock.WiremockService;

@RestClientTest(InstructorReportJobSingleGameFactory.class)

public class InstructorReportJobSingleGameFactoryTests extends JobTestCase {

    @MockBean
    ReportService reportService;

    @MockBean
    GameRepository gameRepository;

    @Autowired
    InstructorReportJobSingleGameFactory InstructorReportJobSingleGameFactory;

    @Test
    void test_create() throws Exception {

        // Act
        InstructorReportJobSingleGame instructorReportJobSingleGame = (InstructorReportJobSingleGame) InstructorReportJobSingleGameFactory.create(17L);

        // Assert
        assertEquals(17L,instructorReportJobSingleGame.getGameId());
        assertEquals(reportService,instructorReportJobSingleGame.getReportService());
        assertEquals(gameRepository,instructorReportJobSingleGame.getGameRepository());
    }
}

