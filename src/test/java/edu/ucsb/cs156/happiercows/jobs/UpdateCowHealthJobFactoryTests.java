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
import edu.ucsb.cs156.happiercows.services.CommonsPlusBuilderService;

@RestClientTest(UpdateCowHealthJobFactory.class)

public class UpdateCowHealthJobFactoryTests extends JobTestCase {

    @MockBean
    CommonsRepository commonsRepository;

    @MockBean
    FarmerRepository farmerRepository;

    @MockBean
    UserRepository userRepository;

    @Autowired
    UpdateCowHealthJobFactory updateCowHealthJobFactory;

    @MockBean
    CommonsPlusBuilderService commonsPlusBuilderService;

    @Test
    void test_create() throws Exception {

        // Act
        UpdateCowHealthJob updateCowHealthJob = (UpdateCowHealthJob) updateCowHealthJobFactory.create();

        // Assert
        assertEquals(commonsRepository,updateCowHealthJob.getCommonsRepository());
        assertEquals(farmerRepository,updateCowHealthJob.getFarmerRepository());
        assertEquals(userRepository,updateCowHealthJob.getUserRepository());

    }
}

