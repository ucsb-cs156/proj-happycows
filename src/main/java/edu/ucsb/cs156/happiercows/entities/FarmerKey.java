package edu.ucsb.cs156.happiercows.entities;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.Embeddable;
import jakarta.persistence.JoinColumn;
import java.io.Serializable;


@Data
@Embeddable
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FarmerKey implements Serializable {
    @JoinColumn(name = "user_id")
    private long userId;

    @JoinColumn(name = "game_id")
    private long gameId;

}
