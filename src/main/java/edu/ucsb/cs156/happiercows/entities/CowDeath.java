package edu.ucsb.cs156.happiercows.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.AccessLevel;



@Data
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Entity(name = "cowdeath")
public class CowDeath {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  @Column(name="commons_id")
  private long commonsId;

  @Column(name="user_id")
  private long userId;
  
  private LocalDateTime zonedDateTime;
  private Integer cowsKilled; 
  private double avgHealth; 

}
