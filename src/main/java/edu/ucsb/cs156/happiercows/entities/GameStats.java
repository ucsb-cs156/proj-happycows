package edu.ucsb.cs156.happiercows.entities;

import java.time.Instant;

import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "gamestats")
public class GameStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private long gameId;
    private int numCows;
    private double avgHealth;
    private int effectiveCapacity;

    @CreationTimestamp
    @Column(name = "create_date")
    private Instant createDate;

}
