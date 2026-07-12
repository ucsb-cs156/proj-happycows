package edu.ucsb.cs156.happiercows.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DashboardSettingsParams {
    private boolean showLeaderboard;
    private boolean showOverviewSection;
    private boolean showCowsPerFarmerSection;
    private boolean showHistogramSection;
    private boolean showTrendsSection;
    private boolean showFarmerLeaderboardSection;
}
