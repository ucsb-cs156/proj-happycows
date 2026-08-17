package edu.ucsb.cs156.happiercows.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ParticipationGradeParams {
    private Long courseId;
    private LocalDate startDate;
    private LocalDate endDate;

    // Weights are whole percentage points and must sum to 100; a weight of 0
    // disables that criterion.
    private int criterion1Weight;
    private int criterion2Weight;
    private int criterion3Weight;

    // criterion2MinDays is "n" in issue #292: the number of distinct days of
    // interaction required for full credit on criterion 2.
    private int criterion2MinDays;
    private boolean criterion2PartialCredit;

    private double totalPoints;
}
