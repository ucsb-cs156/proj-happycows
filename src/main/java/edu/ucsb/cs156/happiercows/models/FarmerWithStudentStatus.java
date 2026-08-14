package edu.ucsb.cs156.happiercows.models;

import lombok.*;

// A Farmer's leaderboard row, plus whether they're a student on the roster
// of the course their game is linked to (see issue #291: the leaderboard's
// admin-only Activity column only makes sense for farmers whose activity is
// actually tracked, i.e. course-linked games and farmers who are students
// on that course's roster).
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FarmerWithStudentStatus {
    private long userId;
    private long gameId;
    private String username;
    private double totalWealth;
    private int numOfCows;
    private double cowHealth;
    private int cowsBought;
    private int cowsSold;
    private int cowDeaths;
    private boolean student;
}
