package edu.ucsb.cs156.happiercows.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ParticipationGrade {
    private long studentId;
    private String perm;
    private String lastName;
    private String firstMiddleName;

    private boolean interactedAtLeastOnce;
    private int daysInteracted;
    private boolean ownedAndCheckedInOnACow;

    private double criterion1PointsEarned;
    private double criterion2PointsEarned;
    private double criterion3PointsEarned;
    private double totalPointsEarned;
}
