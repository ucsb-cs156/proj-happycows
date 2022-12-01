package edu.ucsb.cs156.happiercows.jobs;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.jobs.Job;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.UserCommonsRepository;
import edu.ucsb.cs156.happiercows.services.jobs.JobContext;

@ExtendWith(SpringExtension.class)
@ContextConfiguration
public class UpdateCowHealthJobTests {


    @MockBean 
    CommonsRepository commonsRepository;
    
    @MockBean
    UserCommonsRepository userCommonsRepository;

    @Test
    void test_log_output() throws Exception {

        // Arrange

        List<Commons> commonsList = new ArrayList<Commons>();

        // TODO:  You will actually need to fill commonsList with at least one Commons object
        // if the test is really going to test anything significant, but this is a good start.

        when(commonsRepository.findAll()).thenReturn(commonsList);


        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        // Act

        UpdateCowHealthJob updateCowHealthJob = new UpdateCowHealthJob(commonsRepository, userCommonsRepository);
        updateCowHealthJob.accept(ctx);

        // Assert

        String expected = "Starting to update cow health.\n" +
               // "This is where the code to update the cow's health will go.\n" +
                "Cows Health has been updated!";

        assertEquals(expected, jobStarted.getLog());

    }
}