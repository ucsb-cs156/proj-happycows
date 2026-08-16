package edu.ucsb.cs156.happiercows.entities;

import java.time.LocalDateTime;
import java.util.Date;

import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonGetter;

import edu.ucsb.cs156.happiercows.strategies.CowHealthUpdateStrategies;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private long gameId;

    private String name;
    private double cowPrice;
    private double milkPrice;
    private double startingBalance;
    private LocalDateTime startingDate;
    private boolean showLeaderboard;
    private int capacityPerUser;
    private int carryingCapacity;
    private double degradationRate;

    // these defaults match old behavior
    @Enumerated(EnumType.STRING)
    private CowHealthUpdateStrategies belowCapacityHealthUpdateStrategy;
    @Enumerated(EnumType.STRING)
    private CowHealthUpdateStrategies aboveCapacityHealthUpdateStrategy;
    private int numUsers;
    private int numCows;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "create_date")
    private Date createDate;

    @Transient
    @JsonGetter("effectiveCapacity")
    public int getEffectiveCapacity() {
        return Math.max(capacityPerUser * numUsers, carryingCapacity);
    }

}
