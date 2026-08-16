package edu.ucsb.cs156.happiercows.jobs;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import edu.ucsb.cs156.happiercows.JobTestCase;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.services.GameStatsService;

@RestClientTest(RecordGameStatsJobFactory.class)

public class RecordGameStatsJobFactoryTests extends JobTestCase {

    @MockBean
    GameStatsService gameStatsService;

    @MockBean
    GameRepository gameRepository;

    @Autowired
    RecordGameStatsJobFactory RecordGameStatsJobFactory;

    @Test
    void test_create() throws Exception {

        // Act
        RecordGameStatsJob recordGameStatsJob = (RecordGameStatsJob) RecordGameStatsJobFactory.create();

        // Assert
        assertEquals(gameRepository,recordGameStatsJob.getGameRepository());
        assertEquals(gameStatsService,recordGameStatsJob.getGameStatsService());

    }
}
