package edu.ucsb.cs156.happiercows.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.entities.FarmerActivity;
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.Student;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.repositories.FarmerActivityRepository;

@ExtendWith(SpringExtension.class)
@Import(FarmerActivityService.class)
@ContextConfiguration
public class FarmerActivityServiceTests {

    @MockBean
    CourseAccessService courseAccessService;

    @MockBean
    FarmerActivityRepository farmerActivityRepository;

    @Autowired
    FarmerActivityService farmerActivityService;

    User user = User.builder().id(1L).email("student@ucsb.edu").build();
    Game game = Game.builder().id(2L).courseId(5L).build();
    Farmer farmer = Farmer.builder().user(user).game(game).build();
    Student student = Student.builder().id(42L).email("student@ucsb.edu").courseId(5L).build();

    @Test
    public void records_activity_when_a_matching_student_is_found() {
        when(courseAccessService.findMatchingStudentForCourseLinkedGame(user, game))
                .thenReturn(Optional.of(student));

        farmerActivityService.recordActivityIfStudentMatch(
                user, game, farmer, FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0);

        FarmerActivity expected = FarmerActivity.builder()
                .farmer(farmer)
                .studentId(42L)
                .activityType(FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW)
                .numCows(0)
                .build();

        ArgumentCaptor<FarmerActivity> captor = ArgumentCaptor.forClass(FarmerActivity.class);
        verify(farmerActivityRepository).save(captor.capture());
        FarmerActivity saved = captor.getValue();

        assertEquals(expected.getFarmer(), saved.getFarmer());
        assertEquals(expected.getStudentId(), saved.getStudentId());
        assertEquals(expected.getActivityType(), saved.getActivityType());
        assertEquals(expected.getNumCows(), saved.getNumCows());
    }

    @Test
    public void records_buy_activity_with_numCows() {
        when(courseAccessService.findMatchingStudentForCourseLinkedGame(user, game))
                .thenReturn(Optional.of(student));

        farmerActivityService.recordActivityIfStudentMatch(
                user, game, farmer, FarmerActivity.ACTIVITY_TYPE_BUY, 3);

        var captor = org.mockito.ArgumentCaptor.forClass(FarmerActivity.class);
        verify(farmerActivityRepository).save(captor.capture());
        FarmerActivity saved = captor.getValue();

        assertEquals(FarmerActivity.ACTIVITY_TYPE_BUY, saved.getActivityType());
        assertEquals(3, saved.getNumCows());
    }

    @Test
    public void does_not_record_activity_when_no_matching_student() {
        when(courseAccessService.findMatchingStudentForCourseLinkedGame(user, game))
                .thenReturn(Optional.empty());

        farmerActivityService.recordActivityIfStudentMatch(
                user, game, farmer, FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, 0);

        verify(farmerActivityRepository, never()).save(any());
    }
}
