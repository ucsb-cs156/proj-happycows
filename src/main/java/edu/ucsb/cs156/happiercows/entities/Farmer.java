package edu.ucsb.cs156.happiercows.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;

@Data
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Entity(name = "farmer")
public class Farmer {
    @EmbeddedId
    @JsonIgnore
    @Builder.Default
    private FarmerKey id = new FarmerKey();

    @MapsId("userId")
    @ManyToOne
    @JsonIgnore
    private User user;

    @MapsId("commonsId")
    @ManyToOne
    @JsonIgnore
    private Commons commons;

    private String username;

    private double totalWealth;

    private int numOfCows;

    private double cowHealth;

    private int cowsBought;

    private int cowsSold;

    private int cowDeaths;

    // userID and commonsId are used by the frontend
    @JsonInclude
    public long getUserId() {
      return user.getId();
    }

    @JsonInclude
    public long getCommonsId() {
        return commons.getId();
    }

    public void setId(FarmerKey id) {
        this.id = id;
    }
    
    public FarmerKey getId() {
        return this.id;
    }
}
