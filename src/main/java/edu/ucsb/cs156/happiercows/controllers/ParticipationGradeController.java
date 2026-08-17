package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.helpers.ParticipationGradeCSVHelper;
import edu.ucsb.cs156.happiercows.models.ParticipationGrade;
import edu.ucsb.cs156.happiercows.models.ParticipationGradeParams;
import edu.ucsb.cs156.happiercows.services.ParticipationGradeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "ParticipationGrade")
@RequestMapping("/api/participationgrade")
@RestController
public class ParticipationGradeController extends ApiController {

    @Autowired
    ParticipationGradeService participationGradeService;

    @Operation(summary = "Compute participation grades for a course's roster over a date range")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/compute")
    public List<ParticipationGrade> compute(
            @Parameter(name = "courseId") @RequestParam Long courseId,
            @Parameter(name = "startDate") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(name = "endDate") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(name = "criterion1Weight") @RequestParam int criterion1Weight,
            @Parameter(name = "criterion2Weight") @RequestParam int criterion2Weight,
            @Parameter(name = "criterion2MinDays") @RequestParam int criterion2MinDays,
            @Parameter(name = "criterion2PartialCredit") @RequestParam boolean criterion2PartialCredit,
            @Parameter(name = "criterion3Weight") @RequestParam int criterion3Weight,
            @Parameter(name = "totalPoints") @RequestParam double totalPoints) {

        ParticipationGradeParams params = toParams(courseId, startDate, endDate, criterion1Weight,
                criterion2Weight, criterion2MinDays, criterion2PartialCredit, criterion3Weight, totalPoints);

        return participationGradeService.computeGrades(params);
    }

    @Operation(summary = "Download computed participation grades for a course's roster as a csv")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/download")
    public ResponseEntity<Resource> download(
            @Parameter(name = "courseId") @RequestParam Long courseId,
            @Parameter(name = "startDate") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(name = "endDate") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(name = "criterion1Weight") @RequestParam int criterion1Weight,
            @Parameter(name = "criterion2Weight") @RequestParam int criterion2Weight,
            @Parameter(name = "criterion2MinDays") @RequestParam int criterion2MinDays,
            @Parameter(name = "criterion2PartialCredit") @RequestParam boolean criterion2PartialCredit,
            @Parameter(name = "criterion3Weight") @RequestParam int criterion3Weight,
            @Parameter(name = "totalPoints") @RequestParam double totalPoints) throws IOException {

        ParticipationGradeParams params = toParams(courseId, startDate, endDate, criterion1Weight,
                criterion2Weight, criterion2MinDays, criterion2PartialCredit, criterion3Weight, totalPoints);

        List<ParticipationGrade> grades = participationGradeService.computeGrades(params);

        String filename = String.format("participationGrades%05d.csv", courseId);

        ByteArrayInputStream bais = ParticipationGradeCSVHelper.toCSV(grades);
        InputStreamResource isr = new InputStreamResource(bais);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/csv")).body(isr);
    }

    private ParticipationGradeParams toParams(Long courseId, LocalDate startDate, LocalDate endDate,
            int criterion1Weight, int criterion2Weight, int criterion2MinDays, boolean criterion2PartialCredit,
            int criterion3Weight, double totalPoints) {
        return ParticipationGradeParams.builder()
                .courseId(courseId)
                .startDate(startDate)
                .endDate(endDate)
                .criterion1Weight(criterion1Weight)
                .criterion2Weight(criterion2Weight)
                .criterion2MinDays(criterion2MinDays)
                .criterion2PartialCredit(criterion2PartialCredit)
                .criterion3Weight(criterion3Weight)
                .totalPoints(totalPoints)
                .build();
    }
}
