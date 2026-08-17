package edu.ucsb.cs156.happiercows.controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.models.ParticipationGrade;
import edu.ucsb.cs156.happiercows.models.ParticipationGradeParams;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.services.ParticipationGradeService;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ParticipationGradeController.class)
public class ParticipationGradeControllerTests extends ControllerTestCase {

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    UserRepository userRepository;

    @MockBean
    ParticipationGradeService participationGradeService;

    private final ParticipationGrade grade1 = ParticipationGrade.builder()
            .studentId(10L)
            .perm("1111111")
            .lastName("Gaucho")
            .firstMiddleName("Chris")
            .interactedAtLeastOnce(true)
            .daysInteracted(3)
            .ownedAndCheckedInOnACow(true)
            .criterion1PointsEarned(40.0)
            .criterion2PointsEarned(24.0)
            .criterion3PointsEarned(20.0)
            .totalPointsEarned(84.0)
            .build();

    private final ParticipationGrade grade2 = ParticipationGrade.builder()
            .studentId(20L)
            .perm("2222222")
            .lastName("Delgado")
            .firstMiddleName("Jamie")
            .interactedAtLeastOnce(false)
            .daysInteracted(0)
            .ownedAndCheckedInOnACow(false)
            .criterion1PointsEarned(0.0)
            .criterion2PointsEarned(0.0)
            .criterion3PointsEarned(0.0)
            .totalPointsEarned(0.0)
            .build();

    private String queryString() {
        return "courseId=1&startDate=2026-01-01&endDate=2026-01-10"
                + "&criterion1Weight=40&criterion2Weight=40&criterion2MinDays=5&criterion2PartialCredit=true"
                + "&criterion3Weight=20&totalPoints=100";
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_compute_grades() throws Exception {
        when(participationGradeService.computeGrades(any(ParticipationGradeParams.class)))
                .thenReturn(List.of(grade1, grade2));

        MvcResult response = mockMvc.perform(get("/api/participationgrade/compute?" + queryString()))
                .andDo(print()).andExpect(status().isOk()).andReturn();

        String responseString = response.getResponse().getContentAsString();
        List<ParticipationGrade> actual =
                objectMapper.readValue(responseString, new TypeReference<List<ParticipationGrade>>() {
                });
        assertEquals(List.of(grade1, grade2), actual);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void compute_passes_the_query_params_through_to_the_service() throws Exception {
        when(participationGradeService.computeGrades(any(ParticipationGradeParams.class)))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/participationgrade/compute?" + queryString()))
                .andExpect(status().isOk());

        ArgumentCaptor<ParticipationGradeParams> captor = ArgumentCaptor.forClass(ParticipationGradeParams.class);
        verify(participationGradeService, times(1)).computeGrades(captor.capture());

        ParticipationGradeParams params = captor.getValue();
        assertEquals(1L, params.getCourseId());
        assertEquals(LocalDate.parse("2026-01-01"), params.getStartDate());
        assertEquals(LocalDate.parse("2026-01-10"), params.getEndDate());
        assertEquals(40, params.getCriterion1Weight());
        assertEquals(40, params.getCriterion2Weight());
        assertEquals(5, params.getCriterion2MinDays());
        assertEquals(true, params.isCriterion2PartialCredit());
        assertEquals(20, params.getCriterion3Weight());
        assertEquals(100.0, params.getTotalPoints());
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_download_grades_as_csv() throws Exception {
        when(participationGradeService.computeGrades(any(ParticipationGradeParams.class)))
                .thenReturn(List.of(grade1, grade2));

        MvcResult response = mockMvc.perform(get("/api/participationgrade/download?" + queryString()))
                .andDo(print()).andExpect(status().isOk()).andReturn();

        assertEquals("application/csv", response.getResponse().getContentType());
        assertEquals(
                "attachment; filename=participationGrades00001.csv",
                response.getResponse().getHeader("Content-Disposition"));

        String expected =
                "perm,lastName,firstMiddleName,interactedAtLeastOnce,daysInteracted,ownedAndCheckedInOnACow,"
                        + "criterion1PointsEarned,criterion2PointsEarned,criterion3PointsEarned,totalPointsEarned\r\n"
                        + "1111111,Gaucho,Chris,true,3,true,40.0,24.0,20.0,84.0\r\n"
                        + "2222222,Delgado,Jamie,false,0,false,0.0,0.0,0.0,0.0\r\n";
        assertEquals(expected, response.getResponse().getContentAsString());
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void download_with_no_grades_produces_a_header_only_csv() throws Exception {
        when(participationGradeService.computeGrades(any(ParticipationGradeParams.class)))
                .thenReturn(List.of());

        MvcResult response = mockMvc.perform(get("/api/participationgrade/download?" + queryString()))
                .andExpect(status().isOk()).andReturn();

        String expected =
                "perm,lastName,firstMiddleName,interactedAtLeastOnce,daysInteracted,ownedAndCheckedInOnACow,"
                        + "criterion1PointsEarned,criterion2PointsEarned,criterion3PointsEarned,totalPointsEarned\r\n";
        assertEquals(expected, response.getResponse().getContentAsString());
    }
}
