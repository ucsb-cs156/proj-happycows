package edu.ucsb.cs156.happiercows.entities;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "farmer_activity")

public class FarmerActivity {

    public static final int ACTIVITY_TYPE_PLAY_PAGE_VIEW = 0;
    public static final int ACTIVITY_TYPE_BUY = 1;
    public static final int ACTIVITY_TYPE_SELL = 2;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    // See Profit.farmer for why this is a @ManyToOne over Farmer's composite
    // (user_id, game_id) key rather than a single farmerId column: Farmer
    // has no single-column primary key to reference.
    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "user_id", referencedColumnName = "user_id"),
        @JoinColumn(name = "game_id", referencedColumnName = "game_id")
    })
    private Farmer farmer;

    private Long studentId;
    private LocalDateTime timestamp;
    private int activityType;
    private int numCows;
}
