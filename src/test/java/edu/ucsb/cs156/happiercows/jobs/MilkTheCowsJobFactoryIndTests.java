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

@RestClientTest(MilkTheCowsJobFactoryInd.class)

public class MilkTheCowsJobFactoryIndTests extends JobTestCase {

    @MockBean
    GameRepository gameRepository;

    @MockBean
    FarmerRepository farmerRepository;

    @MockBean
    UserRepository userRepository;

    @MockBean
    ProfitRepository profitRepository;

    @Autowired
    MilkTheCowsJobFactoryInd MilkTheCowsJobFactoryInd;

    @Test
    void test_create() throws Exception {

        // Act
        MilkTheCowsJobInd milkTheCowsJobInd = (MilkTheCowsJobInd) MilkTheCowsJobFactoryInd.create(1L);

        // Assert
        assertEquals(gameRepository,milkTheCowsJobInd.getGameRepository());
        assertEquals(farmerRepository,milkTheCowsJobInd.getFarmerRepository());
        assertEquals(userRepository,milkTheCowsJobInd.getUserRepository());
        assertEquals(profitRepository,milkTheCowsJobInd.getProfitRepository());

    }
}

