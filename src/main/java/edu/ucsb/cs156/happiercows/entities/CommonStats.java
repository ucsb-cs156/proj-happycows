package edu.ucsb.cs156.happiercows.entities;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import org.hibernate.annotations.CreationTimestamp;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "commonstats")
public class CommonStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private long commonsId;
    private int numCows;
    private double avgHealth;
    
    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "create_date")
    private Date createDate;

}
