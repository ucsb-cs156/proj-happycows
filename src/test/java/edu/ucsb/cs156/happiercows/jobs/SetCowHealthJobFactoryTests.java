package edu.ucsb.cs156.happiercows.jobs;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import edu.ucsb.cs156.happiercows.JobTestCase;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;

@RestClientTest(SetCowHealthJobFactory.class)

public class SetCowHealthJobFactoryTests extends JobTestCase {

    @MockBean
    CommonsRepository commonsRepository;

    @MockBean
    FarmerRepository farmerRepository;

    @MockBean
    UserRepository userRepository;

    @Autowired
    SetCowHealthJobFactory setCowHealthJobFactory;

    @Test
    void test_create() throws Exception {

        // Act
        SetCowHealthJob setCowHealthJob = (SetCowHealthJob) setCowHealthJobFactory.create(117L,2.0);

        // Assert
        assertEquals(commonsRepository,setCowHealthJob.getCommonsRepository());
        assertEquals(farmerRepository,setCowHealthJob.getFarmerRepository());
        assertEquals(userRepository,setCowHealthJob.getUserRepository());

    }
}

