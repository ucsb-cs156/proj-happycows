package edu.ucsb.cs156.happiercows.jobs;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import edu.ucsb.cs156.happiercows.JobTestCase;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.services.CommonStatsService;

@RestClientTest(RecordCommonStatsJobFactory.class)

public class RecordCommonStatsJobFactoryTests extends JobTestCase {

    @MockBean
    CommonStatsService commonStatsService;

    @MockBean
    GameRepository gameRepository;

    @Autowired
    RecordCommonStatsJobFactory RecordCommonStatsJobFactory;

    @Test
    void test_create() throws Exception {

        // Act
        RecordCommonStatsJob recordCommonStatsJob = (RecordCommonStatsJob) RecordCommonStatsJobFactory.create();

        // Assert
        assertEquals(gameRepository,recordCommonStatsJob.getGameRepository());
        assertEquals(commonStatsService,recordCommonStatsJob.getCommonStatsService());

    }
}
