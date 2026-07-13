package edu.ucsb.cs156.happiercows.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import edu.ucsb.cs156.happiercows.strategies.CowHealthUpdateStrategies;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;



@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "commons")
public class Commons {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;
    private double cowPrice;
    private double milkPrice;
    private double startingBalance;
    private LocalDateTime startingDate;

    @Column(nullable = false)
    private LocalDateTime lastDate;

    private boolean showLeaderboard;

    @Builder.Default
    private boolean showChat = true;
    
    private int capacityPerUser;
    private int carryingCapacity;
    private double degradationRate;

    private boolean hidden;

    // these defaults match old behavior
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CowHealthUpdateStrategies belowCapacityHealthUpdateStrategy = CowHealthUpdateStrategies.DEFAULT_BELOW_CAPACITY;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CowHealthUpdateStrategies aboveCapacityHealthUpdateStrategy = CowHealthUpdateStrategies.DEFAULT_ABOVE_CAPACITY;


    @OneToMany(mappedBy = "commons", cascade = CascadeType.REMOVE)
    @JsonIgnore
    private List<UserCommons> joinedUsers;

    /**
     * The starting date is the first day of play, and the last date is the
     * last day of play: a game is in progress from midnight (00:00 local
     * time) at the beginning of the starting date, up to (but not including)
     * midnight at the end of the last date.
     *
     * @param now the date/time to check against
     * @return whether the game is in progress at <code>now</code>
     */
    public boolean gameInProgress(LocalDateTime now) {
        LocalDateTime gameStart = startingDate.toLocalDate().atStartOfDay();
        LocalDateTime gameEnd = lastDate.toLocalDate().plusDays(1).atStartOfDay();
        return !now.isBefore(gameStart) && now.isBefore(gameEnd);
    }

    public boolean gameInProgress() {
        return gameInProgress(LocalDateTime.now());
    }

    /**
     * The end date has passed when <code>now</code> is at or after midnight
     * at the end of the last date (i.e. the last date is the last day of
     * play).
     *
     * @param now the date/time to check against
     * @return whether the game has ended as of <code>now</code>
     */
    public boolean endDateHasPassed(LocalDateTime now) {
        LocalDateTime gameEnd = lastDate.toLocalDate().plusDays(1).atStartOfDay();
        return !now.isBefore(gameEnd);
    }
}
