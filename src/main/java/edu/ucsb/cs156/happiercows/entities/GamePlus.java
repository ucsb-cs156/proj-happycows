package edu.ucsb.cs156.happiercows.entities;

import lombok.Data;

import com.fasterxml.jackson.annotation.JsonGetter;


import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GamePlus {
    private Game game;
    private Integer totalCows;
    private Integer totalUsers;
    private Double averageCowsPerFarmer;
    private Double medianCowsPerFarmer;
    private Integer minimumCowsPerFarmer;
    private Integer maximumCowsPerFarmer;
    private Double standardDeviationCowsPerFarmer;


    @JsonGetter("effectiveCapacity")
    public int getEffectiveCapacity() {
        return Math.max(game.getCapacityPerUser() * totalUsers, game.getCarryingCapacity());
    }


}