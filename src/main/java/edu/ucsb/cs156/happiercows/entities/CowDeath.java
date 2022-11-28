package edu.ucsb.cs156.happiercows.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.time.LocalDateTime;


import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import javax.persistence.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "cow_death")

public class CowDeath {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    
    @Column(name="commons_id")
    private long commonsId;  

    @Column(name="user_id")
    private long userId;  

    private LocalDateTime ZonedDateTime;
    private Integer cowsKilled;
    private long avgHealth;
}
