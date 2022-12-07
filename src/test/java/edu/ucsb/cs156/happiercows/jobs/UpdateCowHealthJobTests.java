package edu.ucsb.cs156.happiercows.jobs;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Answers.valueOf;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.longThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.UserCommons;
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

        when(commonsRepository.findAll()).thenReturn(commonsList);


        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        // Act

        UpdateCowHealthJob updateCowHealthJob = new UpdateCowHealthJob(commonsRepository, userCommonsRepository);
        updateCowHealthJob.accept(ctx);

        // Assert

        String expected = "Starting to update cow health.\n" +
                "Cows Health has been updated!";

        assertEquals(expected, jobStarted.getLog());

    }

    @Test
    void test_cow_health_increase() throws Exception {


        // Arrange

        LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");
        LocalDateTime ldt2 = LocalDateTime.parse("2022-01-10T00:00:00");

        List<Commons> commonsList = new ArrayList<Commons>();

        List<User> userList1 = new ArrayList<User>();
        List<User> userList2 = new ArrayList<User>();

        User user1 = User.builder()
            .id(0)
            .email("gaucho@ucsb.edu")
            .googleSub("string")
            .pictureUrl("str")
            .fullName("string")
            .givenName("string")
            .familyName("string")
            .emailVerified(true)
            .locale("string")
            .hostedDomain("string")
            .admin(true)
            .build();

        userList1.add(user1);

        Commons commons1 = Commons.builder()
            .id(0)
            .name("commons1")
            .cowPrice(10)
            .milkPrice(5)
            .startingBalance(100)
            .startingDate(ldt1)
            .endingDate(ldt2)
            .degradationRate(5)
            .showLeaderboard(false)
            .carryingCapacity(10)
            .users(userList1)
            .build();
        
        Commons commons2 = Commons.builder()
            .id(1)
            .name("commons2")
            .cowPrice(10)
            .milkPrice(5)
            .startingBalance(100)
            .startingDate(ldt1)
            .endingDate(ldt2)
            .degradationRate(5)
            .showLeaderboard(false)
            .carryingCapacity(10)
            .users(userList2)
            .build();

        UserCommons userCommons = UserCommons.builder()
            .id(1)
            .commonsId(0)
            .userId(0)
            .totalWealth(100)
            .numOfCows(5)
            .avgCowHealth(50)
            .build();
        
        UserCommons userCommonsEdited = UserCommons.builder()
            .id(1)
            .commonsId(0)
            .userId(0)
            .totalWealth(100)
            .numOfCows(5)
            .avgCowHealth(55)
            .build();
        
        commonsList.add(commons1);
        commonsList.add(commons2);

        when(commonsRepository.findAll()).thenReturn(commonsList);
        when(commonsRepository.getNumCows(anyLong())).thenReturn(Optional.of(5));
        when(userCommonsRepository.findByCommonsIdAndUserId(0L, 0L)).thenReturn(Optional.of(userCommons));

        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        // Act

        UpdateCowHealthJob updateCowHealthJob = new UpdateCowHealthJob(commonsRepository, userCommonsRepository);
        updateCowHealthJob.accept(ctx);

        verify(userCommonsRepository, times(1)).save(userCommonsEdited);

    }

    @Test
    void test_cow_health_decrease() throws Exception {


        // Arrange

        LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");
        LocalDateTime ldt2 = LocalDateTime.parse("2022-01-10T00:00:00");

        List<Commons> commonsList = new ArrayList<Commons>();

        List<User> userList1 = new ArrayList<User>();
        List<User> userList2 = new ArrayList<User>();

        User user1 = User.builder()
            .id(0)
            .email("gaucho@ucsb.edu")
            .googleSub("string")
            .pictureUrl("str")
            .fullName("string")
            .givenName("string")
            .familyName("string")
            .emailVerified(true)
            .locale("string")
            .hostedDomain("string")
            .admin(true)
            .build();

        userList1.add(user1);

        Commons commons1 = Commons.builder()
            .id(0)
            .name("commons1")
            .cowPrice(10)
            .milkPrice(5)
            .startingBalance(100)
            .startingDate(ldt1)
            .endingDate(ldt2)
            .degradationRate(5)
            .showLeaderboard(false)
            .carryingCapacity(10)
            .users(userList1)
            .build();
        
        Commons commons2 = Commons.builder()
            .id(1)
            .name("commons2")
            .cowPrice(10)
            .milkPrice(5)
            .startingBalance(100)
            .startingDate(ldt1)
            .endingDate(ldt2)
            .degradationRate(5)
            .showLeaderboard(false)
            .carryingCapacity(10)
            .users(userList2)
            .build();

        UserCommons userCommons = UserCommons.builder()
            .id(1)
            .commonsId(0)
            .userId(0)
            .totalWealth(100)
            .numOfCows(12)
            .avgCowHealth(50)
            .build();
        
        UserCommons userCommonsEdited = UserCommons.builder()
            .id(1)
            .commonsId(0)
            .userId(0)
            .totalWealth(100)
            .numOfCows(12)
            .avgCowHealth(40)
            .build();
        
        commonsList.add(commons1);
        commonsList.add(commons2);

        when(commonsRepository.findAll()).thenReturn(commonsList);
        when(commonsRepository.getNumCows(anyLong())).thenReturn(Optional.of(12));
        when(userCommonsRepository.findByCommonsIdAndUserId(0L, 0L)).thenReturn(Optional.of(userCommons));

        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        // Act

        UpdateCowHealthJob updateCowHealthJob = new UpdateCowHealthJob(commonsRepository, userCommonsRepository);
        updateCowHealthJob.accept(ctx);

        verify(userCommonsRepository, times(1)).save(userCommonsEdited);

    }
    
    @Test
    void test_cow_health_decrease_exactly() throws Exception {


        // Arrange

        LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");
        LocalDateTime ldt2 = LocalDateTime.parse("2022-01-10T00:00:00");

        List<Commons> commonsList = new ArrayList<Commons>();

        List<User> userList1 = new ArrayList<User>();
        List<User> userList2 = new ArrayList<User>();

        User user1 = User.builder()
            .id(0)
            .email("gaucho@ucsb.edu")
            .googleSub("string")
            .pictureUrl("str")
            .fullName("string")
            .givenName("string")
            .familyName("string")
            .emailVerified(true)
            .locale("string")
            .hostedDomain("string")
            .admin(true)
            .build();

        userList1.add(user1);

        Commons commons1 = Commons.builder()
            .id(0)
            .name("commons1")
            .cowPrice(10)
            .milkPrice(5)
            .startingBalance(100)
            .startingDate(ldt1)
            .endingDate(ldt2)
            .degradationRate(5)
            .showLeaderboard(false)
            .carryingCapacity(10)
            .users(userList1)
            .build();
        
        Commons commons2 = Commons.builder()
            .id(1)
            .name("commons2")
            .cowPrice(10)
            .milkPrice(5)
            .startingBalance(100)
            .startingDate(ldt1)
            .endingDate(ldt2)
            .degradationRate(5)
            .showLeaderboard(false)
            .carryingCapacity(10)
            .users(userList2)
            .build();

        UserCommons userCommons = UserCommons.builder()
            .id(1)
            .commonsId(0)
            .userId(0)
            .totalWealth(100)
            .numOfCows(10)
            .avgCowHealth(50)
            .build();
        
        UserCommons userCommonsEdited = UserCommons.builder()
            .id(1)
            .commonsId(0)
            .userId(0)
            .totalWealth(100)
            .numOfCows(10)
            .avgCowHealth(55)
            .build();
        
        commonsList.add(commons1);
        commonsList.add(commons2);

        when(commonsRepository.findAll()).thenReturn(commonsList);
        when(commonsRepository.getNumCows(anyLong())).thenReturn(Optional.of(10));
        when(userCommonsRepository.findByCommonsIdAndUserId(0L, 0L)).thenReturn(Optional.of(userCommons));

        Job jobStarted = Job.builder().build();
        JobContext ctx = new JobContext(null, jobStarted);

        // Act

        UpdateCowHealthJob updateCowHealthJob = new UpdateCowHealthJob(commonsRepository, userCommonsRepository);
        updateCowHealthJob.accept(ctx);

        verify(userCommonsRepository, times(1)).save(userCommonsEdited);

    }
    
}