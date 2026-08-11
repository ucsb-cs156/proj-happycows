package edu.ucsb.cs156.happiercows.jobs;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import edu.ucsb.cs156.happiercows.JobTestCase;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.ProfitRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;

@RestClientTest(MilkTheCowsJobFactory.class)

public class MilkTheCowsJobFactoryTests extends JobTestCase {

    @MockBean
    GameRepository gameRepository;

    @MockBean
    FarmerRepository farmerRepository;

    @MockBean
    UserRepository userRepository;

    @MockBean
    ProfitRepository profitRepository;

    @Autowired
    MilkTheCowsJobFactory MilkTheCowsJobFactory;

    @Test
    void test_create() throws Exception {

        // Act
        MilkTheCowsJob milkTheCowsJob = (MilkTheCowsJob) MilkTheCowsJobFactory.create();

        // Assert
        assertEquals(gameRepository,milkTheCowsJob.getGameRepository());
        assertEquals(farmerRepository,milkTheCowsJob.getFarmerRepository());
        assertEquals(userRepository,milkTheCowsJob.getUserRepository());
        assertEquals(profitRepository,milkTheCowsJob.getProfitRepository());

    }
}

